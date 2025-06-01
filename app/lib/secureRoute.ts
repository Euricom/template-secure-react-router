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

// Types for validation results
type ValidationResult<T> = { data: T; error?: never } | { data?: never; error: Error };
type ValidationResultWithFieldErrors<T> =
  | { data: T; error?: never }
  | { data?: never; error: Error; fieldErrors: Record<string, string[]> };

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
};

// Loader specific configuration
type ProtectedLoaderConfig<
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
> = BaseProtectedConfig<T, P, Q> & {
  function: (
    args: Omit<LoaderFunctionArgs, "params"> & {
      identity: Identity;
      params: ValidationResult<P extends z.ZodSchema ? StrictParams<z.infer<P>> : null>;
      query: ValidationResult<Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null>;
    }
  ) => T;
};

// Action specific configuration with form validation
type ProtectedActionConfig<
  T = any,
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
> = BaseProtectedConfig<T, P, Q> & {
  formValidation?: F;
  function: (
    args: Omit<ActionFunctionArgs, "params"> & {
      identity: Identity;
      params: ValidationResult<P extends z.ZodSchema ? StrictParams<z.infer<P>> : null>;
      query: ValidationResult<Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null>;
      form: ValidationResultWithFieldErrors<
        F extends z.ZodSchema ? StrictParams<z.infer<F>> : null
      >;
    }
  ) => T;
};

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
      params: parsedParams,
      query: parsedQuery,
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
  F extends z.ZodSchema | undefined = undefined,
>(config: ProtectedActionConfig<T, P, Q, F>) {
  return async (args: ActionFunctionArgs) => {
    const parsedParams = validateParams(args.params, config.paramValidation);
    const parsedQuery = validateQueryParams(
      new URL(args.request.url).searchParams,
      config.queryValidation
    );
    const parsedForm = await validateFormData(args.request, config.formValidation);
    const identity = await validateIdentity(args.request, config.permissions);
    const { params: _, ...rest } = args;
    return await config.function({
      ...rest,
      identity,
      params: parsedParams,
      query: parsedQuery,
      form: parsedForm,
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

function validateParams(params: any, schema?: z.ZodSchema): ValidationResult<any> {
  if (!schema) {
    return { data: null };
  }

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return { error: new Error(parsed.error.message) };
  }

  return { data: parsed.data };
}

function validateQueryParams(
  searchParams: URLSearchParams,
  schema?: z.ZodSchema
): ValidationResult<any> {
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
    return { error: new Error(parsed.error.message) };
  }

  return { data: parsed.data };
}

async function validateFormData(
  request: Request,
  schema?: z.ZodSchema
): Promise<ValidationResultWithFieldErrors<any>> {
  if (!schema) {
    return { data: null };
  }

  // Check if the request has form data
  const contentType = request.headers.get("content-type") || "";
  if (
    !contentType.includes("application/x-www-form-urlencoded") &&
    !contentType.includes("multipart/form-data")
  ) {
    return { data: null };
  }

  try {
    const formData = await request.formData();
    const data: Record<string, string | File> = {};

    // Convert FormData to a plain object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const safeFieldErrors: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(fieldErrors)) {
        safeFieldErrors[key] = value || [];
      }
      return {
        error: new Error(parsed.error.message),
        fieldErrors: safeFieldErrors,
      };
    }

    return { data: parsed.data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const safeFieldErrors: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(fieldErrors)) {
        safeFieldErrors[key] = value || [];
      }
      return {
        error: new Error(
          "Failed to parse form data: " + (error instanceof Error ? error.message : String(error))
        ),
        fieldErrors: safeFieldErrors,
      };
    }
    return {
      error: new Error(
        "Failed to parse form data: " + (error instanceof Error ? error.message : String(error))
      ),
      fieldErrors: {},
    };
  }
}
