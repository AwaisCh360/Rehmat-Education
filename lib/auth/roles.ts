export const APP_ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT"
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
