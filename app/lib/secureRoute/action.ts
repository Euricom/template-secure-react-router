import type { ActionFunctionArgs } from "react-router";
import type { z } from "zod";
import type { BaseConfig, StrictParams } from "./base";
import { type Identity, type PermissionCheck, validateIdentity } from "./identityCheck";
import { type ValidationResult, parseInputs } from "./inputParsing";

type BaseFunctionArgs<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = Omit<ActionFunctionArgs, "params"> & {
  params: ValidationResult<P extends z.ZodSchema ? StrictParams<z.infer<P>> : null>;
  query: ValidationResult<Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null>;
};

type PublicActionConfig<
  // biome-ignore lint/suspicious/noExplicitAny: This is the response type of the loader, we cant know what it is
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "public";
  formValidation?: F;
  function: (
    args: BaseFunctionArgs<P, Q> & {
      form: ValidationResult<F extends z.ZodSchema ? StrictParams<z.infer<F>> : null>;
    }
  ) => T;
};

type ProtectedActionConfig<
  // biome-ignore lint/suspicious/noExplicitAny: This is the response type of the loader, we cant know what it is
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "loggedIn" | PermissionCheck;
  formValidation?: F;
  function: (
    args: BaseFunctionArgs<P, Q> & {
      identity: Identity;
      form: ValidationResult<F extends z.ZodSchema ? StrictParams<z.infer<F>> : null>;
    }
  ) => T;
};

export function createPublicAction<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
>(config: PublicActionConfig<T, P, Q, F>) {
  return async (args: ActionFunctionArgs) => {
    if (!config.function) {
      throw new Error("function is required");
    }

    const { params, query, form } = await parseInputs(
      args,
      config.paramValidation,
      config.queryValidation,
      config.formValidation
    );
    const { params: _, ...rest } = args;

    return await config.function({
      ...rest,
      params,
      query,
      form,
    });
  };
}

export function createProtectedAction<
  T,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
>(config: ProtectedActionConfig<T, P, Q, F>) {
  return async (args: ActionFunctionArgs) => {
    if (!config.function) {
      throw new Error("function is required");
    }

    const { params, query, form } = await parseInputs(
      args,
      config.paramValidation,
      config.queryValidation,
      config.formValidation
    );
    const { params: _, ...rest } = args;
    const identity = await validateIdentity(args.request, config.permissions);

    return await config.function({
      ...rest,
      identity,
      params,
      query,
      form,
    });
  };
}
