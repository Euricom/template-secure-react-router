import { useState } from "react";
import { Form, useFetcher, useLoaderData } from "react-router";
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
  const updateFetcher = useFetcher<{
    success?: boolean;
    error?: string;
    errors?: Record<string, string[]>;
  }>();
  const isSubmitting = updateFetcher.state === "submitting";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Manage your organization settings.</CardDescription>
        </CardHeader>
        <updateFetcher.Form method="post" action="/app/organization/update" autoComplete="off">
          <CardContent className="space-y-4 py-4">
            <InputWithLabel
              label="Name"
              id="name"
              name="name"
              defaultValue={activeOrg.name}
              error={updateFetcher.data?.errors?.name?.[0]}
              autoFocus
            />
            <input type="hidden" name="organizationId" value={activeOrg.id} />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>

            {updateFetcher.data?.error && (
              <div className="text-center text-destructive text-sm">{updateFetcher.data.error}</div>
            )}
            {updateFetcher.data?.success && (
              <div className="text-center text-green-600 text-sm">
                Organization updated successfully!
              </div>
            )}
          </CardFooter>
        </updateFetcher.Form>
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
