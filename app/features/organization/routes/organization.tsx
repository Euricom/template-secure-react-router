import { useState } from "react";
import { Form, useLoaderData, useNavigation } from "react-router";
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
            Remove this organization and all its data. This action cannot be
            undone.
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
              This will permanently delete your organization and all its data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form method="post" action="/app/organization/delete">
            <input type="hidden" name="organizationId" value={activeOrg.id} />
            <input type="hidden" name="intent" value="delete" />
            <AlertDialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
              >
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
