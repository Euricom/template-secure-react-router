import { createContext } from "react";
import { createContextualCan } from "@casl/react";
import type { AnyAbility } from "@casl/ability";

export const AbilityContext = createContext<AnyAbility>({} as AnyAbility);

export const Can = createContextualCan(AbilityContext.Consumer);

export default function PermissionProvider({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: AnyAbility;
}) {
  return <AbilityContext.Provider value={permissions}>{children}</AbilityContext.Provider>;
}
