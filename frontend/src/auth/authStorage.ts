import type { AuthUser, UserRole } from "../types/auth";

const TOKEN_KEY = "jwt";
const USER_KEY = "user";

const validRoles: UserRole[] = [
  "REPORTER",
  "SUPPORT_AGENT",
  "MANAGER",
  "ADMIN",
];

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    if (!isAuthUser(parsedUser)) {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
}

export function saveAuthentication(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthentication(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Partial<AuthUser>;

  return (
    typeof user.userId === "number" &&
    typeof user.username === "string" &&
    typeof user.fullName === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    validRoles.includes(user.role as UserRole)
  );
}
