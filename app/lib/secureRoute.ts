import type { ActionFunctionArgs } from "react-router";

import type { LoaderFunctionArgs } from "react-router";
import { ensureCanWithIdentity } from "./permissions.server";
import { getUserInformation } from "./identity.server";
import type { Subject } from "@casl/ability";

type PermissionCheck = {
  action: string;
  subject: string | Subject;
};

type ProtectedLoaderConfig<T = any> = {
  permissions: PermissionCheck;
  function: (
    args: LoaderFunctionArgs & { identity: Awaited<ReturnType<typeof getUserInformation>> }
  ) => T;
};

export function createProtectedLoader<T>(config: ProtectedLoaderConfig<T>) {
  return async (args: LoaderFunctionArgs) => {
    const identity = await getUserInformation(args.request);
    ensureCanWithIdentity(identity, config.permissions.action, config.permissions.subject);
    return await config.function({ ...args, identity });
  };
}

type ProtectedActionConfig<T = any> = {
  permissions: PermissionCheck;
  function: (
    args: ActionFunctionArgs & { identity: Awaited<ReturnType<typeof getUserInformation>> }
  ) => T;
};

export function createProtectedAction<T>(config: ProtectedActionConfig<T>) {
  return async (args: ActionFunctionArgs) => {
    const identity = await getUserInformation(args.request);
    ensureCanWithIdentity(identity, config.permissions.action, config.permissions.subject);
    return await config.function({ ...args, identity });
  };
}
