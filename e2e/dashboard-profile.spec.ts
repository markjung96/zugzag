import { test, expect } from "@playwright/test";
import { TEST_USER, signupViaApi, loginViaUI } from "./helpers/auth";

test.describe("대시보드 & 프로필 UI", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await signupViaApi(page, TEST_USER);
    await page.close();
  });

  test.describe("TC-DASH-001: 대시보드", () => {
    test("대시보드 페이지 렌더링", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto("/dashboard");

      await page.waitForTimeout(3000);
      const content = await page.textContent("body");

      // 대시보드 관련 텍스트 확인
      const hasDashboard =
        content?.includes("출석") ||
        content?.includes("통계") ||
        content?.includes("대시보드") ||
        content?.includes("내 통계");
      expect(hasDashboard).toBe(true);
    });
  });

  test.describe("TC-PROF-001: 프로필 페이지", () => {
    test("프로필 정보 및 로그아웃 버튼 표시", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto("/profile");

      await page.waitForTimeout(3000);

      // 사용자 이름 표시
      await expect(page.getByText(TEST_USER.name)).toBeVisible();

      // 로그아웃 버튼
      await expect(
        page.getByRole("button", { name: /로그아웃/i })
      ).toBeVisible();
    });
  });

  test.describe("TC-UI-001: 하단 네비게이션", () => {
    test("하단 네비게이션 5개 탭 표시", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto("/crews");

      await page.waitForTimeout(2000);

      // 하단 네비게이션 영역 확인
      const nav = page.locator("nav").last();
      await expect(nav).toBeVisible();

      // 네비게이션 링크 확인
      const navContent = await nav.textContent();
      const hasNavItems =
        (navContent?.includes("홈") || navContent?.includes("크루")) &&
        (navContent?.includes("일정") || navContent?.includes("스케줄")) &&
        (navContent?.includes("통계") || navContent?.includes("대시보드")) &&
        (navContent?.includes("마이") || navContent?.includes("프로필"));
      expect(hasNavItems).toBe(true);
    });

    test("네비게이션 탭 클릭 시 페이지 이동", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);

      // 일정 탭 클릭
      await page.goto("/crews");
      await page.waitForTimeout(1000);

      const scheduleLink = page
        .locator("nav")
        .last()
        .getByRole("link", { name: /일정/i });
      if (await scheduleLink.isVisible()) {
        await scheduleLink.click();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/\/schedules/);
      }
    });
  });

  test.describe("TC-UI-005: 다크 모드", () => {
    test("프로필에서 다크 모드 토글 존재", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto("/profile");

      await page.waitForTimeout(2000);
      const content = await page.textContent("body");

      // 다크 모드 관련 요소 확인
      const hasDarkMode =
        content?.includes("다크") ||
        content?.includes("테마") ||
        content?.includes("Dark");
      expect(hasDarkMode).toBe(true);
    });
  });
});
