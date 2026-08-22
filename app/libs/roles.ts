export const ROLE = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
  SPV: "SPV",
  CASHIER: "CASHIER",
  CUSTOMER: "CUSTOMER",
  OTHER: "OTHER",
} as const;

export type RoleType = (typeof ROLE)[keyof typeof ROLE];
