export type UserRole = "REPORTER" | "SUPPORT_AGENT" | "MANAGER" | "ADMIN";

export interface AuthUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
}
