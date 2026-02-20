import { type Page, expect } from "@playwright/test";

/** 테스트 계정 정보 (각 실행마다 고유) */
const ts = Date.now();
export const TEST_USER = {
  name: "E2E테스터",
  email: `e2e-${ts}@zugzag.test`,
  password: "test1234!",
};

export const TEST_MEMBER = {
  name: "E2E멤버",
  email: `e2e-member-${ts}@zugzag.test`,
  password: "test1234!",
};

/** 회원가입 (API 직접 호출) */
export async function signupViaApi(
  page: Page,
  user: { name: string; email: string; password: string }
) {
  const response = await page.request.post("/api/auth/signup", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      agreedToTerms: true,
      agreedToPrivacy: true,
    },
  });
  return response;
}

/** UI를 통한 로그인 (실제 input placeholder 기반) */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // 이메일 입력 (placeholder: "example@email.com")
  await page.getByPlaceholder("example@email.com").fill(email);
  // 비밀번호 입력 (placeholder: "8자 이상")
  await page.getByPlaceholder("8자 이상").fill(password);
  // submit 버튼 클릭
  await page.locator('button[type="submit"]').click();

  // 로그인 후 리다이렉트 대기 (최대 15초)
  await page.waitForURL(/\/(crews|dashboard|schedules)/, { timeout: 15000 });
}

/** 로그인 상태 확인 */
export async function expectLoggedIn(page: Page) {
  const url = page.url();
  expect(url).toMatch(/\/(crews|dashboard|schedules|profile)/);
}

/** 로그아웃 */
export async function logout(page: Page) {
  await page.goto("/profile");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /로그아웃/i }).click();
  await page.waitForURL(/\/login/, { timeout: 10000 });
}
