import type { Subject } from "@casl/ability";
import { getUserInformation } from "../identity.server";
import { ensureCanWithIdentity } from "../permissions.server";

export type PermissionCheck = {
  action: string;
  subject: string | Subject;
};

export type Identity = Awaited<ReturnType<typeof getUserInformation>>;

export async function validateIdentity(
  request: Request,
  permissions: PermissionCheck | "loggedIn"
): Promise<Identity> {
  const identity = await getUserInformation(request);
  if (permissions === "loggedIn") {
    return identity;
  }

  ensureCanWithIdentity(identity, permissions.action, permissions.subject);
  return identity;
}
