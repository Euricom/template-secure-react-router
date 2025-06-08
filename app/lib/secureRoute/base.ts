import type { z } from "zod";

export type StrictParams<T> = {
  [K in keyof T]: T[K];
};

export type BaseConfig<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = {
  paramValidation?: P;
  queryValidation?: Q;
};
