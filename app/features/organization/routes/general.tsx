import {
  useLoaderData,
  useActionData,
  useNavigation,
  Form,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "~/components/ui/alert-dialog";
import { useState } from "react";
import { auth } from "~/lib/auth";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { getUserInformation } from "~/lib/identity.server";

const orgNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const identity = await getUserInformation(request);

  const formData = await request.formData();
  const intent = formData.get("intent");
  const name = formData.get("name") as string | undefined;
  const organizationId = formData.get("organizationId") as string;

  if (intent === "edit") {
    ensureCanWithIdentity(identity, "update", "Organization");

    try {
      const validated = orgNameSchema.parse({ name });
      // TODO: Replace with actual updateOrganization API if available
      if (typeof auth.api.updateOrganization !== "function") {
        return { error: "Organization update API not implemented" };
      }
      await auth.api.updateOrganization({
        headers: request.headers,
        body: {
          organizationId,
          data: {
            name: validated.name,
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
  }

  if (intent === "delete") {
    ensureCanWithIdentity(identity, "delete", "Organization");

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
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "read", "Organization");

  const activeOrg = await auth.api.getFullOrganization({
    headers: request.headers,
    params: {
      organizationId: identity.organization.id,
    },
  });
  return { activeOrg };
}

export default function OrganizationGeneral() {
  const { activeOrg } = useLoaderData<{ activeOrg: { id: string; name: string; slug: string } }>();
  const actionData = useActionData<typeof action>();
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
        <Form method="post" autoComplete="off">
          <CardContent className="space-y-4 py-4">
            <InputWithLabel
              label="Name"
              id="name"
              name="name"
              defaultValue={activeOrg.name}
              error={actionData?.errors?.name?.[0]}
              autoFocus
            />
            <input type="hidden" name="organizationId" value={activeOrg.id} />
            <input type="hidden" name="intent" value="edit" />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-stretch">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {actionData?.error && (
              <div className="text-destructive text-sm text-center">{actionData.error}</div>
            )}
            {actionData?.success && <div className="text-success text-sm text-center">Saved!</div>}
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
          <Form method="post">
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
