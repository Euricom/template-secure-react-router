import {
  AbilityBuilder,
  type Subject,
  createMongoAbility,
} from "@casl/ability";
import type { getUserInformation } from "./identity.server";

type UserType =
  | {
      id: string;
      role?: string | null;
      organizationId?: string | null;
      organizationRole?: string | null;
    }
  | null
  | undefined;

export const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  // User can read their own profile
  cannot("read", "User");
  can("read", "User", { id: user.id });

  // Users can read all products
  can("read", "Product");

  // users can only manage their own products
  cannot("manage", "Product");
  can("manage", "Product", { userId: user.id });

  // Users can only see their own organization
  cannot("read", "Organization");
  can("read", "Organization", { id: user.organizationId });
  // Every user can create an organization
  can("create", "Organization");
  // Every user can accept invitations
  can("accept", "Organization:Members:Invite");

  // Users with org:admin or org:owner can manage the organization
  if (user.organizationRole === "admin" || user.organizationRole === "owner") {
    can("manage", "Organization");
    can("manage", "Organization:Members");
  }

  // Admins can manage all products and users
  if (user.role === "admin") {
    can("manage", "Product");
    can("manage", "User");
    can("manage", "Organization");
  }

  return build();
};

export const ensureCanWithIdentity = (
  identity: Awaited<ReturnType<typeof getUserInformation>> | null,
  action: string,
  subject: string | Subject
) => {
  if (!identity) {
    throw new Error("User is not logged in");
  }

  const organization =
    "organization" in identity ? identity.organization : null;

  const abilityy = ability({
    id: identity.user.id,
    role: identity.user.role,
    organizationId: organization?.id ?? null,
    organizationRole: organization?.role ?? null,
  });

  if (!abilityy.can(action, subject)) {
    if (organization) {
      throw new Error(
        `User (${identity.user.id} - ${identity.user.role}) in organization (${organization.id} - ${organization.role})  does not have permission to perform this action: ${action} ${subject}`
      );
    }
    throw new Error(
      `User (${identity.user.id} - ${identity.user.role}) does not have permission to perform this action: ${action} ${subject}`
    );
  }
};
