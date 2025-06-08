import type { LoaderFunctionArgs } from "react-router";
import type z from "zod";
import type { BaseConfig } from "./base";
import { type Identity, type PermissionCheck, validateIdentity } from "./identityCheck";
import { type ValidationResultOutput, parseInputs } from "./inputParsing";

type BaseFunctionArgs<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = Omit<LoaderFunctionArgs, "params"> & {
  params: ValidationResultOutput<P>;
  query: ValidationResultOutput<Q>;
};

type PublicLoaderConfig<
  T = unknown,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "public";
  function: (args: BaseFunctionArgs<P, Q>) => T;
};

type ProtectedLoaderConfig<
  T = unknown,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "loggedIn" | PermissionCheck;
  function: (args: BaseFunctionArgs<P, Q> & { identity: Identity }) => T;
};

async function createLoaderHandler<
  T,
  P extends z.ZodSchema | undefined,
  Q extends z.ZodSchema | undefined,
>(config: PublicLoaderConfig<T, P, Q> | ProtectedLoaderConfig<T, P, Q>, args: LoaderFunctionArgs) {
  const result = await parseInputs<P, Q, undefined>(
    args,
    config.paramValidation,
    config.queryValidation
  );
  const { params: _, ...rest } = args;

  const baseArgs = {
    ...rest,
    params: result.params,
    query: result.query,
  };

  if (config.permissions === "public") {
    return await config.function(baseArgs);
  }

  const identity = await validateIdentity(args.request, config.permissions);
  return await config.function({ ...baseArgs, identity });
}

export const createPublicLoader =
  <T, P extends z.ZodSchema | undefined = undefined, Q extends z.ZodSchema | undefined = undefined>(
    config: PublicLoaderConfig<T, P, Q>
  ) =>
  (args: LoaderFunctionArgs) =>
    createLoaderHandler(config, args);

export const createProtectedLoader =
  <T, P extends z.ZodSchema | undefined = undefined, Q extends z.ZodSchema | undefined = undefined>(
    config: ProtectedLoaderConfig<T, P, Q>
  ) =>
  (args: LoaderFunctionArgs) =>
    createLoaderHandler(config, args);
