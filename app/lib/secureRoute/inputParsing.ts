import type { LoaderFunctionArgs, Params } from "react-router";
import { z } from "zod";
import type { StrictParams } from "./base";

const CONTENT_TYPES = {
  FORM_URLENCODED: "application/x-www-form-urlencoded",
} as const;

const ERROR_MESSAGES = {
  FILE_NOT_SUPPORTED: "File uploads are not supported",
  FORM_PARSE_ERROR: "Failed to parse form data:",
} as const;

export type ValidationResultOutput<T> = ValidationResult<
  T extends z.ZodSchema ? StrictParams<z.infer<T>> : null
>;

type ValidationResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: Error; fieldErrors?: Record<string, string[]> };

type ParseInputsResult<
  P extends z.ZodSchema | undefined,
  Q extends z.ZodSchema | undefined,
  F extends z.ZodSchema | undefined,
> = {
  params: ValidationResult<P extends z.ZodSchema ? StrictParams<z.infer<P>> : null>;
  query: ValidationResult<Q extends z.ZodSchema ? StrictParams<z.infer<Q>> : null>;
  form: ValidationResult<F extends z.ZodSchema ? StrictParams<z.infer<F>> : null>;
};

export async function parseInputs<
  P extends z.ZodSchema | undefined = undefined,
  Q extends z.ZodSchema | undefined = undefined,
  F extends z.ZodSchema | undefined = undefined,
>(
  args: LoaderFunctionArgs,
  paramSchema?: P,
  querySchema?: Q,
  formSchema?: F
): Promise<ParseInputsResult<P, Q, F>> {
  const parsedParams = validateParams(args.params, paramSchema);
  const parsedQuery = validateQueryParams(new URL(args.request.url).searchParams, querySchema);
  const parsedForm = await validateFormData(args.request, formSchema);
  return { params: parsedParams, query: parsedQuery, form: parsedForm };
}

function validateParams<T extends z.ZodSchema | undefined>(
  params: Params,
  schema?: T
): ValidationResult<T extends z.ZodSchema ? StrictParams<z.infer<T>> : null> {
  if (!schema) {
    return { data: null as T extends z.ZodSchema ? StrictParams<z.infer<T>> : null };
  }

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return { error: new Error(parsed.error.message) };
  }

  return { data: parsed.data };
}

// TODO: use custom error
function validateQueryParams<T extends z.ZodSchema | undefined>(
  searchParams: URLSearchParams,
  schema?: T
): ValidationResult<T extends z.ZodSchema ? StrictParams<z.infer<T>> : null> {
  if (!schema) {
    return { data: null as T extends z.ZodSchema ? StrictParams<z.infer<T>> : null };
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

async function validateFormData<T extends z.ZodSchema | undefined>(
  request: Request,
  schema?: T
): Promise<ValidationResult<T extends z.ZodSchema ? StrictParams<z.infer<T>> : null>> {
  if (!schema) {
    return { data: null as T extends z.ZodSchema ? StrictParams<z.infer<T>> : null };
  }

  // Check if the request has form data
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes(CONTENT_TYPES.FORM_URLENCODED)) {
    return { data: null as T extends z.ZodSchema ? StrictParams<z.infer<T>> : null };
  }

  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};

    // Convert FormData to a plain object
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        throw new Error(ERROR_MESSAGES.FILE_NOT_SUPPORTED);
      }
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
          `${ERROR_MESSAGES.FORM_PARSE_ERROR} ${error instanceof Error ? error.message : String(error)}`
        ),
        fieldErrors: safeFieldErrors,
      };
    }
    return {
      error: new Error(
        `${ERROR_MESSAGES.FORM_PARSE_ERROR} ${error instanceof Error ? error.message : String(error)}`
      ),
      fieldErrors: {},
    };
  }
}
