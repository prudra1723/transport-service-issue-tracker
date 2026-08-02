import { apiClient } from "./axios";

import type {
  CreateUserRequest,
  ResetPasswordRequest,
  UpdateActiveRequest,
  UpdateRoleRequest,
  User,
} from "../types/user";

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/admin/users");

  return response.data;
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>("/admin/users", request);

  return response.data;
}

export async function updateUserRole(
  id: number,
  request: UpdateRoleRequest,
): Promise<User> {
  const response = await apiClient.patch<User>(
    `/admin/users/${id}/role`,
    request,
  );

  return response.data;
}

export async function updateUserActive(
  id: number,
  request: UpdateActiveRequest,
): Promise<User> {
  const response = await apiClient.patch<User>(
    `/admin/users/${id}/active`,
    request,
  );

  return response.data;
}

export async function resetPassword(
  id: number,
  request: ResetPasswordRequest,
): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/password`, request);
}
