import { redirect } from "react-router";
import z from "zod";
import { auth } from "~/lib/auth";
import {
  createProtectedAction,
  createProtectedLoader,
} from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "update",
    subject: "Organization",
  },
  formValidation: z.object({
    name: z.string().min(1, "Name is required"),
    organizationId: z.string(),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      return {
        success: false,
        error: "Failed to update organization",
        errors: form.fieldErrors,
      };
    }
    const { name, organizationId } = form.data;

    try {
      await auth.api.updateOrganization({
        headers: request.headers,
        body: {
          organizationId,
          data: {
            name: name,
          },
        },
      });
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { errors: error.flatten().fieldErrors };
      }
      return { error: "Failed to update organization" };
    }
  },
});

export const loader = createProtectedLoader({
  function: async () => {
    return redirect("/app/organization");
  },
});
