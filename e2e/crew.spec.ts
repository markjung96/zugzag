import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_MEMBER, signupViaApi, loginViaUI } from "./helpers/auth";

/** 테스트 상태 공유 */
let crewId: string;
let inviteCode: string;

test.describe("크루 관리 (Crew Management)", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await signupViaApi(page, TEST_USER);
    await signupViaApi(page, TEST_MEMBER);
    await page.close();
  });

  test.describe("TC-CREW-001: 크루 생성", () => {
    test("크루 생성 UI 플로우", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);

      await page.goto("/crews/new");
      await page.waitForLoadState("networkidle");

      // 크루 이름 입력 (placeholder: "예: 클라이밍 크루", id="name")
      await page.locator("#name").fill("E2E 테스트 크루");
      // 크루 설명 입력 (id="description")
      const descInput = page.locator("#description");
      if (await descInput.isVisible()) {
        await descInput.fill("Playwright E2E 테스트용 크루");
      }

      // 생성 버튼 클릭 ("크루 만들기")
      await page.locator('button[type="submit"]').click();

      // 크루 상세 페이지로 리다이렉트 대기 (/crews/<uuid>, /crews/new 제외)
      await page.waitForURL(/\/crews\/(?!new|join)/, { timeout: 15000 });

      // 크루가 생성되었는지 확인 (API로)
      const crewsRes = await page.request.get("/api/crews");
      const crewsData = await crewsRes.json();
      const myCrew = crewsData.crews?.find(
        (c: { name: string }) => c.name === "E2E 테스트 크루"
      );
      expect(myCrew).toBeTruthy();
      crewId = myCrew.id;

      // 초대 코드 확인
      const detailRes = await page.request.get(`/api/crews/${crewId}`);
      const detailData = await detailRes.json();
      inviteCode = detailData.inviteCode;
      expect(inviteCode).toBeTruthy();
      expect(inviteCode).toHaveLength(6);
    });
  });

  test.describe("TC-CREW-005: 크루 상세 조회", () => {
    test("크루 홈 페이지 렌더링", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto(`/crews/${crewId}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      await expect(page.getByText("E2E 테스트 크루")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("TC-CREW-002: 크루 가입", () => {
    test("초대 코드로 크루 가입 UI", async ({ page }) => {
      await loginViaUI(page, TEST_MEMBER.email, TEST_MEMBER.password);

      await page.goto("/crews/join");
      await page.waitForLoadState("networkidle");

      // 초대 코드 입력 (placeholder: "XXXXXX", id="inviteCode")
      await page.locator("#inviteCode").fill(inviteCode);

      // 가입 버튼 클릭 ("크루 가입하기")
      await page.locator('button[type="submit"]').click();

      // 가입 성공 후 이동 확인
      await page.waitForTimeout(5000);
      const content = await page.textContent("body");
      expect(content).toContain("E2E 테스트 크루");
    });
  });

  test.describe("TC-CREW-008: 멤버 목록 조회", () => {
    test("멤버 목록에 두 명 표시", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto(`/crews/${crewId}/members`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(5000);

      // 두 사용자 이름이 페이지에 표시되는지 확인
      await expect(page.getByText(TEST_USER.name).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText(TEST_MEMBER.name).first()).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("TC-UI-007: 빈 상태 처리", () => {
    test("크루 없는 사용자의 빈 상태", async ({ page }) => {
      const newUser = {
        name: "빈상태테스터",
        email: `empty-${Date.now()}@zugzag.test`,
        password: "test1234!",
      };
      await signupViaApi(page, newUser);
      await loginViaUI(page, newUser.email, newUser.password);

      await page.goto("/crews");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      const content = await page.textContent("body");
      const hasEmptyState =
        content?.includes("크루가 없") ||
        content?.includes("소속된 크루") ||
        content?.includes("크루 생성") ||
        content?.includes("크루 가입");
      expect(hasEmptyState).toBe(true);
    });
  });
});
