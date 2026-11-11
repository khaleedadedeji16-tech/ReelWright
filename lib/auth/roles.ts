import type { Enums } from "@/lib/database.types";

export type UserRole = Enums<"user_role">;

export const USER_ROLES: readonly UserRole[] = ["author", "creator", "fanvue"];

/** The name shown to people for each role. */
export const ROLE_LABELS: Record<UserRole, string> = {
  author: "Author",
  creator: "Content creator",
  fanvue: "Fanvue creator",
};

/** Where each role's dashboard lives. */
export const DASHBOARD_PATHS: Record<UserRole, string> = {
  author: "/author",
  creator: "/creator",
  fanvue: "/fanvue",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}
