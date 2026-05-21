export type AppRole =
  | "admin"
  | "dispatcher"
  | "account_manager"
  | "finance"
  | "sales"
  | "technician"
  | "customer";

export interface CommFitUser {
  id: string;
  email: string;
  role: AppRole;
  technicianId?: string;
  accountId?: string;
}

export function parseUserRole(user: { user_metadata?: { role?: string } }): AppRole {
  return (user.user_metadata?.role as AppRole) ?? "customer";
}

/** Derive role from email for mock/dev purposes */
export function mockRoleFromEmail(email: string): AppRole {
  if (email.includes("@commfit.com")) return "dispatcher";
  if (email.includes("@tech.")) return "technician";
  if (email.includes("@admin.")) return "admin";
  if (email.includes("@finance.")) return "finance";
  return "customer";
}
