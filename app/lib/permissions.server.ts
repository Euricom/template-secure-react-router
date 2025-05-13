import { AbilityBuilder, createMongoAbility, type Subject } from "@casl/ability";

type UserType = { id: string; role?: string | null } | null | undefined;

export const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  // Users can read all products
  can("read", "Product");

  // users can only manage their own products
  cannot("manage", "Product");
  can("manage", "Product", { userId: user.id });

  // Admins can manage all products and users
  if (user.role === "admin") {
    can("manage", "Product");
    can("manage", "User");
  }

  return build();
};

export const ensureCan = (user: UserType, action: string, subject: string | Subject) => {
  const abilityy = ability(user);
  if (!abilityy.can(action, subject)) {
    throw new Error("User does not have permission to perform this action");
  }
};
