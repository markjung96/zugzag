import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleError, UnauthorizedError } from "@/lib/errors/app-error";

const UpdateUserDto = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내여야 합니다"),
});

/**
 * 프로필(이름) 수정 API
 * PATCH /api/users/me
 * Body: { name: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name } = UpdateUserDto.parse(body);

    const [updated] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, name: users.name, image: users.image });

    if (!updated) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      image: updated.image,
    });
  } catch (error) {
    return handleError(error);
  }
}
