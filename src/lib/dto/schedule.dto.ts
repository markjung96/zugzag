import { z } from "zod";

export const PlaceInfoDto = z
  .object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    category: z.string().optional(),
    phone: z.string().optional(),
    x: z.string(),
    y: z.string(),
    url: z.string().optional(),
  })
  .optional();

export const RoundDto = z.object({
  roundNumber: z.number().int().min(1).max(5),
  type: z.enum(["exercise", "meal", "afterparty", "other"]),
  title: z.string().min(1).max(50),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "시작 시간 형식이 올바르지 않습니다"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "종료 시간 형식이 올바르지 않습니다"),
  location: z.string().min(1).max(255),
  placeInfo: PlaceInfoDto,
  capacity: z.number().int().min(0).max(100),
});

export const CreateScheduleDto = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다")
    .refine(
      (date) => {
        const today = new Date().toISOString().split("T")[0];
        return date >= today;
      },
      { message: "과거 날짜에는 일정을 생성할 수 없습니다" }
    ),
  description: z.string().max(500).optional(),
  rounds: z.array(RoundDto).min(1, "최소 1개의 일정가 필요합니다").max(5),
});

export const UpdateScheduleDto = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  description: z.string().max(500).optional(),
  rounds: z.array(RoundDto).min(1, "최소 1개의 일정가 필요합니다").max(5),
});
