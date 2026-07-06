export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
