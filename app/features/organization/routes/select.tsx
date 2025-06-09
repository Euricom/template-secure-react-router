import { Plus } from "lucide-react";
import { Form, Link, redirect, useLoaderData } from "react-router";
import z from "zod";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { auth } from "~/lib/auth";
import logger from "~/lib/logging/logger.server";
import { createPublicAction, createPublicLoader } from "~/lib/secureRoute/";

export const action = createPublicAction({
  permissions: "public",
  formValidation: z.object({
    organizationId: z.string(),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      logger.error("public", "Invalid form data during organization selection", {
        error: form.error,
      });
      return { error: "Invalid form data" };
    }
    const { organizationId } = form.data;

    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId,
      },
    });

    return redirect("/app");
  },
});

export const loader = createPublicLoader({
  permissions: "public",
  function: async ({ request }) => {
    const organizations = await auth.api.listOrganizations({
      headers: request.headers,
    });
    return { organizations };
  },
});

export default function Select() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogTitle>Select Organization</AlertDialogTitle>
        <div className="grid gap-4">
          <Link
            to="/app/organization/onboarding"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
          >
            <Plus className="h-5 w-5" />
            Add Other Organization
          </Link>

          {organizations.map((organization) => (
            <Form key={organization.id} method="post">
              <input type="hidden" name="organizationId" value={organization.id} />
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
              >
                {organization.name}
              </button>
            </Form>
          ))}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
