import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { auth } from "~/lib/auth";
import prisma from "~/lib/prismaClient";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "cancel",
    subject: "Organization:Members:Invite",
  },
  paramValidation: z.object({
    inviteId: z.string(),
  }),
  function: async ({ request, params }) => {
    if (params.error) {
      return { success: false, message: params.error.message };
    }
    const { inviteId } = params.data;

    if (!inviteId) {
      return { success: false, message: "Invitation ID is required" };
    }

    await auth.api.cancelInvitation({
      headers: request.headers,
      body: {
        invitationId: inviteId,
      },
    });

    return { success: true, message: "Invitation cancelled successfully" };
  },
});

export const loader = createProtectedLoader({
  permissions: {
    action: "cancel",
    subject: "Organization:Members:Invite",
  },
  paramValidation: z.object({
    inviteId: z.string(),
  }),
  function: async ({ params }) => {
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }

    const { inviteId } = params.data;

    if (!inviteId) {
      return redirect("/app/organization/members");
    }

    const invitee = await prisma.invitation.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invitee) {
      return redirect("/app/organization/members");
    }

    return {
      invite: {
        email: invitee.email,
      },
    };
  },
});

export default function MembersInviteCancel() {
  const { invite } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      navigateToParent();
    }
  }, [actionData]);

  function navigateToParent() {
    setOpen(false);
    navigate(-1);
  }

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Cancel Invitation</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel the invitation for "{invite.email}"?
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Cancel Invitation
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
