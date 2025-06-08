import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

export type ValidationResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: Error; fieldErrors?: Record<string, string[]> };

export async function parseInputs(
  args: LoaderFunctionArgs,
  paramSchema?: z.ZodSchema | undefined,
  querySchema?: z.ZodSchema | undefined,
  formSchema?: z.ZodSchema | undefined
) {
  const parsedParams = validateParams(args.params, paramSchema);
  const parsedQuery = validateQueryParams(new URL(args.request.url).searchParams, querySchema);
  const parsedForm = await validateFormData(args.request, formSchema);
  return { params: parsedParams, query: parsedQuery, form: parsedForm };
}

function validateParams(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  params: any,
  schema?: z.ZodSchema
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): ValidationResult<any> {
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<ValidationResult<any>> {
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
          `Failed to parse form data: ${error instanceof Error ? error.message : String(error)}`
        ),
        fieldErrors: safeFieldErrors,
      };
    }
    return {
      error: new Error(
        `Failed to parse form data: ${error instanceof Error ? error.message : String(error)}`
      ),
      fieldErrors: {},
    };
  }
}
