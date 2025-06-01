import { redirect } from "react-router";
import z from "zod";
import { auth } from "~/lib/auth";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "delete",
    subject: "Organization",
  },
  formValidation: z.object({
    organizationId: z.string(),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      return { success: false, error: "Failed to update organization" };
    }
    const { organizationId } = form.data;

    if (typeof auth.api.deleteOrganization !== "function") {
      return { error: "Organization delete API not implemented" };
    }
    await auth.api.deleteOrganization({
      headers: request.headers,
      body: {
        organizationId,
      },
    });
    return redirect("/app/organization/select");
  },
});

export const loader = createProtectedLoader({
  function: async () => {
    return redirect("/app/organization");
  },
});
