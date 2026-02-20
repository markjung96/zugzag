import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // 순차 실행 (DB 상태 의존)
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // 모바일 뷰포트 테스트
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  // 개발 서버가 이미 실행 중이 아니면 자동 시작
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
