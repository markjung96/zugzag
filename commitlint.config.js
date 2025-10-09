module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 변경
        "style", // 코드 포맷팅, 세미콜론 누락 등
        "refactor", // 코드 리팩토링
        "test", // 테스트 추가 또는 수정
        "chore", // 빌드 프로세스 또는 보조 도구 변경
        "perf", // 성능 개선
        "ci", // CI 설정 변경
        "build", // 빌드 시스템 또는 외부 의존성 변경
        "revert", // 이전 커밋 되돌리기
      ],
    ],
    "subject-case": [0],
  },
};
