import type { ActionFunctionArgs } from "react-router";
import type { z } from "zod";
import type { BaseConfig } from "./base";
import { type Identity, type PermissionCheck, validateIdentity } from "./identityCheck";
import { type ValidationResultOutput, parseInputs } from "./inputParsing";

type BaseFunctionArgs<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = Omit<ActionFunctionArgs, "params"> & {
  params: ValidationResultOutput<P>;
  query: ValidationResultOutput<Q>;
  form: ValidationResultOutput<F>;
};

type PublicActionConfig<
  T = unknown,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "public";
  formValidation?: F extends z.ZodSchema ? F : undefined;
  function: (args: BaseFunctionArgs<P, Q, F>) => T;
};

type ProtectedActionConfig<
  T = unknown,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = BaseConfig<P, Q> & {
  permissions: "loggedIn" | PermissionCheck;
  formValidation?: F extends z.ZodSchema ? F : undefined;
  function: (args: BaseFunctionArgs<P, Q, F> & { identity: Identity }) => T;
};

async function createActionHandler<
  T,
  P extends z.ZodSchema | undefined,
  Q extends z.ZodSchema | undefined,
  F extends z.ZodSchema | undefined,
>(
  config: PublicActionConfig<T, P, Q, F> | ProtectedActionConfig<T, P, Q, F>,
  args: ActionFunctionArgs
) {
  const { params, query, form } = await parseInputs<P, Q, F>(
    args,
    config.paramValidation,
    config.queryValidation,
    config.formValidation
  );
  const { params: _, ...rest } = args;

  const baseArgs = {
    ...rest,
    params,
    query,
    form,
  };

  if (config.permissions === "public") {
    return await config.function(baseArgs);
  }

  const identity = await validateIdentity(args.request, config.permissions);
  return await config.function({ ...baseArgs, identity });
}

export const createPublicAction =
  <
    T,
    P extends z.ZodSchema | undefined = undefined,
    Q extends z.ZodSchema | undefined = undefined,
    F extends z.ZodSchema | undefined = undefined,
  >(
    config: PublicActionConfig<T, P, Q, F>
  ) =>
  (args: ActionFunctionArgs) =>
    createActionHandler(config, args);

export const createProtectedAction =
  <
    T,
    P extends z.ZodSchema | undefined = undefined,
    Q extends z.ZodSchema | undefined = undefined,
    F extends z.ZodSchema | undefined = undefined,
  >(
    config: ProtectedActionConfig<T, P, Q, F>
  ) =>
  (args: ActionFunctionArgs) =>
    createActionHandler(config, args);
