import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleError, UnauthorizedError, BadRequestError } from "@/lib/errors/app-error";

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

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (name.length < 1 || name.length > 50) {
      throw new BadRequestError("이름은 1~50자 사이여야 합니다");
    }

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
