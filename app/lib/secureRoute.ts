import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { ensureCanWithIdentity } from "./permissions.server";
import { getUserInformation } from "./identity.server";
import type { Subject } from "@casl/ability";
import { z } from "zod";

// Types for permission checking
type PermissionCheck = {
  action: string;
  subject: string | Subject;
};

// Types for strict parameter validation
type StrictParams<T> = {
  [K in keyof T]: T[K];
};

type Identity = Awaited<ReturnType<typeof getUserInformation>>;

// Base configuration type for protected routes
type BaseProtectedConfig<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = {
  permissions?: PermissionCheck;
  paramValidation?: P;
  queryValidation?: Q;
  function: (
    args: Omit<LoaderFunctionArgs, "params"> & {
      identity: Identity;
      params: P extends z.ZodSchema ? StrictParams<z.infer<P>> : null;
      query: Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null;
    }
  ) => T;
};

// Loader specific configuration
type ProtectedLoaderConfig<
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseProtectedConfig<T, P, Q>;

// Action specific configuration
type ProtectedActionConfig<
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseProtectedConfig<T, P, Q>;

/**
 * Creates a protected loader function that validates permissions and parameters
 */
export function createProtectedLoader<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
>(config: ProtectedLoaderConfig<T, P, Q>) {
  return async (args: LoaderFunctionArgs) => {
    const parsedParams = validateParams(args.params, config.paramValidation);
    const parsedQuery = validateQueryParams(
      new URL(args.request.url).searchParams,
      config.queryValidation
    );
    const identity = await validateIdentity(args.request, config.permissions);
    const { params: _, ...rest } = args;
    return await config.function({
      ...rest,
      identity,
      params: parsedParams.data,
      query: parsedQuery.data,
    });
  };
}

/**
 * Creates a protected action function that validates permissions and parameters
 */
export function createProtectedAction<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
>(config: ProtectedActionConfig<T, P, Q>) {
  return async (args: ActionFunctionArgs) => {
    const parsedParams = validateParams(args.params, config.paramValidation);
    const parsedQuery = validateQueryParams(
      new URL(args.request.url).searchParams,
      config.queryValidation
    );
    const identity = await validateIdentity(args.request, config.permissions);
    const { params: _, ...rest } = args;
    return await config.function({
      ...rest,
      identity,
      params: parsedParams.data,
      query: parsedQuery.data,
    });
  };
}

// Helper functions
async function validateIdentity(
  request: Request,
  permissions?: PermissionCheck
): Promise<Identity> {
  const identity = await getUserInformation(request);
  if (permissions) {
    ensureCanWithIdentity(identity, permissions.action, permissions.subject);
  }
  return identity;
}

function validateParams(params: any, schema?: z.ZodSchema) {
  if (!schema) {
    return { data: null };
  }

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return { data: parsed.data };
}

function validateQueryParams(searchParams: URLSearchParams, schema?: z.ZodSchema) {
  if (!schema) {
    return { data: null };
  }

  // Convert URLSearchParams to a plain object
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return { data: parsed.data };
}
