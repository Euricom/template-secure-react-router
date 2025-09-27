import type { Subject } from "@casl/ability";
import {
  type IdentityWithOrganization,
  type IdentityWithoutOrganization,
  getUserInformation,
} from "../identity.server";
import { ensureCanWithIdentity } from "../permissions.server";

export type PermissionCheck = {
  action: string;
  subject: string | Subject;
};

type Options = {
  includeOrganization?: boolean;
};

export type Identity = Awaited<ReturnType<typeof getUserInformation>>;

// Overloaded function signatures for better type inference
export async function validateIdentity(
  request: Request,
  permissions: PermissionCheck | "loggedIn",
  options: { includeOrganization: true }
): Promise<IdentityWithOrganization>;

export async function validateIdentity(
  request: Request,
  permissions: PermissionCheck | "loggedIn",
  options: { includeOrganization: false }
): Promise<IdentityWithoutOrganization>;

export async function validateIdentity(
  request: Request,
  permissions: PermissionCheck | "loggedIn",
  options?: Options
): Promise<Identity>;

export async function validateIdentity(
  request: Request,
  permissions: PermissionCheck | "loggedIn",
  options?: Options
): Promise<Identity> {
  const includeOrganization = options?.includeOrganization ?? true;
  const identity = await getUserInformation(request, includeOrganization);
  if (permissions === "loggedIn") {
    return identity;
  }

  ensureCanWithIdentity(identity, permissions.action, permissions.subject);
  return identity;
}
