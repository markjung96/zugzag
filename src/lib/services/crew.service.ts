import { db } from "@/lib/db"
import { crews, crewMembers } from "@/lib/db/schema"
import { eq, sql, inArray } from "drizzle-orm"
import { CrewRepository } from "@/lib/repositories/crew.repository"
import { CrewMemberRepository } from "@/lib/repositories/crew-member.repository"
import { generateUniqueInviteCode } from "@/lib/utils/generate-invite-code"
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/lib/errors/app-error"
import type { CreateCrewDto, UpdateCrewDto, JoinCrewDto } from "@/lib/dto/crew.dto"

/**
 * Crew Service (Controller)
 * 비즈니스 로직 계층
 */
export class CrewService {
  constructor(
    private crewRepo: CrewRepository = new CrewRepository(),
    private memberRepo: CrewMemberRepository = new CrewMemberRepository()
  ) {}

  /**
   * 크루 생성
   */
  async createCrew(userId: string, data: CreateCrewDto) {
    const inviteCode = await generateUniqueInviteCode()

    return await db.transaction(async (tx) => {
      const [crew] = await tx.insert(crews).values({
        name: data.name,
        description: data.description || null,
        inviteCode,
        leaderId: userId,
      }).returning()

      await tx.insert(crewMembers).values({
        crewId: crew.id,
        userId,
        role: "leader",
      })

      return crew
    })
  }

  /**
   * 크루 가입 (초대 코드)
   */
  async joinCrew(userId: string, data: JoinCrewDto) {
    // 크루 찾기
    const crew = await this.crewRepo.findByInviteCode(data.inviteCode)
    if (!crew) {
      throw new NotFoundError("유효하지 않은 초대 코드입니다")
    }

    // 이미 가입했는지 확인
    const isAlreadyMember = await this.memberRepo.isMember(crew.id, userId)
    if (isAlreadyMember) {
      throw new ConflictError("이미 가입한 크루입니다")
    }

    // 멤버 추가
    await this.memberRepo.addMember(crew.id, userId, "member")

    return crew
  }

  /**
   * 크루 조회 (멤버 수 포함)
   */
  async getCrew(crewId: string, userId: string) {
    // 권한 체크 및 역할 조회
    const myRole = await this.memberRepo.getMemberRole(crewId, userId)
    if (!myRole) {
      throw new ForbiddenError("크루 멤버만 조회할 수 있습니다")
    }

    // Vercel Guideline: Promise.all()로 병렬 실행
    const [crew, memberCount] = await Promise.all([
      this.crewRepo.findById(crewId),
      this.crewRepo.getMemberCount(crewId),
    ])

    if (!crew) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    const isLeader = myRole === "leader"
    const canManage = myRole === "leader" || myRole === "admin"

    return {
      ...crew,
      memberCount,
      myRole,
      canManage,
      inviteCode: isLeader ? crew.inviteCode : undefined,
    }
  }

  /**
   * 크루 수정
   */
  async updateCrew(crewId: string, userId: string, data: UpdateCrewDto) {
    // 권한 체크: 크루장만
    const isLeader = await this.memberRepo.isLeader(crewId, userId)
    if (!isLeader) {
      throw new ForbiddenError("크루장만 수정할 수 있습니다")
    }

    const crew = await this.crewRepo.update(crewId, {
      name: data.name,
      description: data.description || null,
    })

    if (!crew) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    return crew
  }

  /**
   * 초대 코드 재생성
   */
  async regenerateInviteCode(crewId: string, userId: string) {
    // 권한 체크: 크루장만
    const isLeader = await this.memberRepo.isLeader(crewId, userId)
    if (!isLeader) {
      throw new ForbiddenError("크루장만 초대 코드를 재생성할 수 있습니다")
    }

    const crew = await this.crewRepo.findById(crewId)
    if (!crew) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    const newCode = await generateUniqueInviteCode()
    const updated = await this.crewRepo.updateInviteCode(crewId, newCode)
    if (!updated) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    return { inviteCode: updated.inviteCode }
  }

  /**
   * 크루 삭제
   */
  async deleteCrew(crewId: string, userId: string) {
    // 권한 체크: 크루장만
    const isLeader = await this.memberRepo.isLeader(crewId, userId)
    if (!isLeader) {
      throw new ForbiddenError("크루장만 삭제할 수 있습니다")
    }

    // 크루 삭제 (CASCADE로 자동 삭제: crew_members, schedules, rsvps)
    await this.crewRepo.delete(crewId)
  }

  /**
   * 크루 멤버 목록 조회
   */
  async getMembers(crewId: string, userId: string) {
    // 권한 체크
    const isMember = await this.memberRepo.isMember(crewId, userId)
    if (!isMember) {
      throw new ForbiddenError("크루 멤버만 조회할 수 있습니다")
    }

    return await this.crewRepo.getMembers(crewId)
  }

  /**
   * 사용자가 속한 크루 목록 조회
   */
  async getUserCrews(userId: string) {
    const userCrews = await this.crewRepo.findByUserId(userId)

    if (userCrews.length === 0) return []

    // 모든 크루의 멤버 수를 한 번에 조회 (N+1 방지)
    const crewIds = userCrews.map((c) => c.id)
    const memberCountRows = await db
      .select({
        crewId: crewMembers.crewId,
        count: sql<number>`count(*)::int`,
      })
      .from(crewMembers)
      .where(inArray(crewMembers.crewId, crewIds))
      .groupBy(crewMembers.crewId)

    const memberCountMap = new Map(memberCountRows.map((r) => [r.crewId, r.count]))

    return userCrews.map((crew) => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      role: crew.role,
      memberCount: memberCountMap.get(crew.id) ?? 0,
      isLeader: crew.leaderId === userId,
    }))
  }
}
