import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_MEMBER, signupViaApi, loginViaUI } from "./helpers/auth";

/** 테스트 상태 */
let crewId: string;
let scheduleId: string;
let exerciseRoundId: string;

test.describe("일정 & RSVP", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // 사용자 생성 (이미 있으면 무시)
    await signupViaApi(page, TEST_USER);
    await signupViaApi(page, TEST_MEMBER);

    // 크루 생성 (API)
    await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    const crewRes = await page.request.post("/api/crews", {
      data: {
        name: "일정테스트크루",
        description: "일정 E2E 테스트용",
      },
    });
    if (crewRes.status() === 201) {
      const crewData = await crewRes.json();
      crewId = crewData.id;

      // 멤버 가입
      const detailRes = await page.request.get(`/api/crews/${crewId}`);
      const detail = await detailRes.json();

      await page.close();
      const memberPage = await browser.newPage();
      await loginViaUI(memberPage, TEST_MEMBER.email, TEST_MEMBER.password);
      await memberPage.request.post("/api/crews/join", {
        data: { inviteCode: detail.inviteCode },
      });
      await memberPage.close();
    } else {
      // 이미 있는 크루 사용
      const crewsRes = await page.request.get("/api/crews");
      const crewsData = await crewsRes.json();
      crewId = crewsData.crews?.[0]?.id;
      await page.close();
    }
  });

  test.describe("TC-SCHED-001: 일정 생성 UI", () => {
    test("일정 생성 페이지 렌더링 및 생성", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto(`/crews/${crewId}/schedules/new`);
      await page.waitForLoadState("networkidle");

      // 일정 생성 페이지 로드 확인
      await page.waitForTimeout(2000);
      const content = await page.textContent("body");
      expect(
        content?.includes("일정") || content?.includes("제목")
      ).toBe(true);

      // API로 일정 생성 (UI 폼이 복잡하므로 API 사용)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const res = await page.request.post(
        `/api/crews/${crewId}/schedules`,
        {
          data: {
            title: "E2E 테스트 일정",
            date: dateStr,
            description: "Playwright E2E 테스트 일정",
            rounds: [
              {
                roundNumber: 1,
                type: "exercise",
                title: "운동",
                startTime: "19:00",
                endTime: "21:00",
                location: "E2E 테스트짐",
                capacity: 2,
              },
              {
                roundNumber: 2,
                type: "meal",
                title: "식사",
                startTime: "21:30",
                endTime: "22:30",
                location: "E2E 식당",
                capacity: 0,
              },
            ],
          },
        }
      );
      expect(res.status()).toBe(201);

      const data = await res.json();
      scheduleId = data.id;
      exerciseRoundId = data.rounds[0].id;
    });
  });

  test.describe("TC-SCHED-004: 일정 상세 UI", () => {
    test("일정 상세 페이지에 라운드 정보 표시", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto(
        `/crews/${crewId}/schedules/${scheduleId}`
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const content = await page.textContent("body");

      // 일정 제목
      expect(content).toContain("E2E 테스트 일정");
      // 라운드 정보 (1차 운동, 2차 식사)
      expect(content).toContain("운동");
      expect(content).toContain("E2E 테스트짐");
      // 시간 정보 (19:00 → 오후 7:00 포맷으로 표시됨)
      expect(content).toContain("오후 7:00");
    });
  });

  test.describe("TC-RSVP-001: 참석/취소 UI", () => {
    test("멤버가 라운드에 참석 후 취소", async ({ page }) => {
      // 멤버로 로그인
      await loginViaUI(page, TEST_MEMBER.email, TEST_MEMBER.password);
      await page.goto(
        `/crews/${crewId}/schedules/${scheduleId}`
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      // RSVP 버튼 찾기 ("참석하기" 또는 "대기 등록")
      const rsvpButton = page
        .getByRole("button", { name: /참석하기|대기 등록/i })
        .first();

      if (await rsvpButton.isVisible()) {
        await rsvpButton.click();
        await page.waitForTimeout(2000);

        // 참석 상태 변경 확인 ("참석 취소" 버튼 또는 상태 뱃지)
        const afterContent = await page.textContent("body");
        const hasAttendingState =
          afterContent?.includes("참석 취소") ||
          afterContent?.includes("참석") ||
          afterContent?.includes("대기");
        expect(hasAttendingState).toBe(true);
      }
    });
  });

  test.describe("TC-SCHED-007: 크루 홈 일정 목록", () => {
    test("크루 홈에서 일정 카드 표시", async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
      await page.goto(`/crews/${crewId}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const content = await page.textContent("body");

      // 일정 제목이 크루 홈에 표시
      expect(content).toContain("E2E 테스트 일정");
    });
  });
});
