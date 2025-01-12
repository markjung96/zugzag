export const MEET_ENDPOINTS = {
  all: () => '/meetings',
  byId: (id: string) => `/meetings/${id}`,
  create: () => '/meetings',
} as const;
