import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { auth } from "~/lib/auth";
import { createProtectedAction } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "create",
    subject: "Organization:Members:Invite",
  },
  formValidation: z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member", "owner"]),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    const { email, role } = form.data;

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return redirect("/login");
    }

    const organizationId = session.session.activeOrganizationId;
    if (!organizationId) {
      return redirect("/app/organization");
    }

    if (role !== "admin" && role !== "member" && role !== "owner") {
      return { success: false, error: "Invalid role" };
    }

    await auth.api.createInvitation({
      headers: request.headers,
      body: {
        email,
        role,
        organizationId,
      },
    });

    return { success: true, message: "Member invited successfully" };
  },
});

export default function MembersInvite() {
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
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Invite a new member to your organization by email.</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          {actionData?.error && <div className="text-destructive text-sm">{actionData.error}</div>}
          <input type="hidden" name="intent" value="invite" />
          <InputWithLabel label="Email" id="invite-email" name="email" type="email" required />
          <div>
            <label htmlFor="role" className="mb-1 block font-medium text-sm">
              Role
            </label>
            <select name="role" className="w-full rounded border p-2">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Send Invite</Button>
            <DialogClose asChild>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
