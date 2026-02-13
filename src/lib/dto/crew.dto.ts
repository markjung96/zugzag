import { z } from "zod"

/**
 * 크루 생성 DTO
 */
export const CreateCrewDto = z.object({
  name: z.string().min(1, "크루 이름은 필수입니다").max(50, "크루 이름은 50자 이하여야 합니다"),
  description: z.string().max(500, "크루 설명은 500자 이하여야 합니다").optional(),
})

export type CreateCrewDto = z.infer<typeof CreateCrewDto>

/**
 * 크루 수정 DTO
 */
export const UpdateCrewDto = z.object({
  name: z.string().min(1, "크루 이름은 필수입니다").max(50, "크루 이름은 50자 이하여야 합니다"),
  description: z.string().max(500, "크루 설명은 500자 이하여야 합니다").optional(),
})

export type UpdateCrewDto = z.infer<typeof UpdateCrewDto>

/**
 * 크루 가입 DTO
 */
export const JoinCrewDto = z.object({
  inviteCode: z
    .string()
    .length(6, "초대 코드는 6자리여야 합니다")
    .regex(/^[A-Z0-9]+$/, "초대 코드는 대문자와 숫자만 포함해야 합니다"),
})

export type JoinCrewDto = z.infer<typeof JoinCrewDto>
