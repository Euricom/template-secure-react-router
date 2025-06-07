import { useState } from "react";
import { type ActionFunctionArgs, Form, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/lib/auth";

import { createProtectedLoader } from "~/lib/secureRoute";

// const orgNameSchema = z.object({
//   name: z.string().min(1, "Name is required"),
// });

// TODO: Move to secureRoute, split up into multiple actions
export async function action({ request }: ActionFunctionArgs) {
  // const identity = await getUserInformation(request);

  // const formData = await request.formData();
  // const intent = formData.get("intent");
  // // const name = formData.get("name") as string | undefined;
  // const organizationId = formData.get("organizationId") as string;

  // if (intent === "edit") {
  //   ensureCanWithIdentity(identity, "update", "Organization");

  //   try {
  //     const validated = orgNameSchema.parse({ name });

  //     await auth.api.updateOrganization({
  //       headers: request.headers,
  //       body: {
  //         organizationId,
  //         data: {
  //           name: validated.name,
  //         },
  //       },
  //     });
  //     return { success: true };
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       return { errors: error.flatten().fieldErrors };
  //     }
  //     return { error: "Failed to update organization" };
  //   }
  // }

  // if (intent === "delete") {
  //   ensureCanWithIdentity(identity, "delete", "Organization");

  //   if (typeof auth.api.deleteOrganization !== "function") {
  //     return { error: "Organization delete API not implemented" };
  //   }
  //   await auth.api.deleteOrganization({
  //     headers: request.headers,
  //     body: {
  //       organizationId,
  //     },
  //   });
  //   return redirect("/app/organization/select");
  // }

  return null;
}

export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "Organization",
  },
  function: async ({ request, identity }) => {
    const activeOrg = await auth.api.getFullOrganization({
      headers: request.headers,
      params: {
        organizationId: identity.organization.id,
      },
    });
    return { activeOrg };
  },
});

export default function OrganizationGeneral() {
  const { activeOrg } = useLoaderData<{
    activeOrg: { id: string; name: string; slug: string };
  }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Manage your organization settings.</CardDescription>
        </CardHeader>
        <Form method="post" action="/app/organization/edit" autoComplete="off">
          {/* TODO: add error feedback from action */}
          <CardContent className="space-y-4 py-4">
            <InputWithLabel
              label="Name"
              id="name"
              name="name"
              defaultValue={activeOrg.name}
              // error={actionData?.errors?.name?.[0]}
              autoFocus
            />
            <input type="hidden" name="organizationId" value={activeOrg.id} />
            <input type="hidden" name="intent" value="edit" />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-stretch">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {/* TODO: add error feedback from action */}

            {/* {actionData?.error && (
              <div className="text-destructive text-sm text-center">{actionData.error}</div>
            )} */}
            {/* {actionData?.success && <div className="text-success text-sm text-center">Saved!</div>} */}
          </CardFooter>
        </Form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Remove this organization and all its data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Organization
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your organization and all its data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form method="post" action="/app/organization/delete">
            <input type="hidden" name="organizationId" value={activeOrg.id} />
            <input type="hidden" name="intent" value="delete" />
            <AlertDialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </AlertDialogFooter>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
