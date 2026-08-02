export type UserRole = "REPORTER" | "SUPPORT_AGENT" | "MANAGER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface UpdateActiveRequest {
  active: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
