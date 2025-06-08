import type { LoaderFunctionArgs } from "react-router";
import type z from "zod";
import type { BaseConfig, StrictParams } from "./base";
import { type Identity, type PermissionCheck, validateIdentity } from "./identityCheck";
import { type ValidationResult, parseInputs } from "./inputParsing";

type BaseFunctionArgs<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = Omit<LoaderFunctionArgs, "params"> & {
  params: ValidationResult<P extends z.ZodSchema ? StrictParams<z.infer<P>> : null>;
  query: ValidationResult<Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null>;
};

type PublicLoaderConfig<
  // biome-ignore lint/suspicious/noExplicitAny: This is the response type of the loader, we cant know what it is
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "public";
  function: (args: BaseFunctionArgs<P, Q>) => T;
};

type ProtectedLoaderConfig<
  // biome-ignore lint/suspicious/noExplicitAny: This is the response type of the loader, we cant know what it is
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "loggedIn" | PermissionCheck;
  function: (
    args: BaseFunctionArgs<P, Q> & {
      identity: Identity;
    }
  ) => T;
};

export function createPublicLoader<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
>(config: PublicLoaderConfig<T, P, Q>) {
  return async (args: LoaderFunctionArgs) => {
    if (!config.function) {
      throw new Error("function is required");
    }

    const result = await parseInputs<P, Q, undefined>(
      args,
      config.paramValidation,
      config.queryValidation
    );
    const { params: _, ...rest } = args;

    return await config.function({
      ...rest,
      params: result.params,
      query: result.query,
    });
  };
}

export function createProtectedLoader<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
>(config: ProtectedLoaderConfig<T, P, Q>) {
  return async (args: LoaderFunctionArgs) => {
    if (!config.function) {
      throw new Error("function is required");
    }

    const result = await parseInputs<P, Q, undefined>(
      args,
      config.paramValidation,
      config.queryValidation
    );
    const { params: _, ...rest } = args;
    const identity = await validateIdentity(args.request, config.permissions);

    return await config.function({
      ...rest,
      identity,
      params: result.params,
      query: result.query,
    });
  };
}
