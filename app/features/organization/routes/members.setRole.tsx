import { useEffect } from "react";
import { useState } from "react";
import { Form, useLoaderData } from "react-router";
import { useNavigate } from "react-router";
import { useActionData } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { auth } from "~/lib/auth";
import prisma from "~/lib/prismaClient";
import { createProtectedLoader } from "~/lib/secureRoute";
import { createProtectedAction } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "setRole",
    subject: "Organization:Members",
  },
  paramValidation: z.object({
    memberId: z.string(),
  }),
  formValidation: z.object({
    role: z.enum(["admin", "member", "owner"]),
  }),
  function: async ({ params, request, form }) => {
    if (params.error) {
      return { success: false, message: params.error.message };
    }
    const { memberId } = params.data;

    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    const { role } = form.data;

    await auth.api.updateMemberRole({
      headers: request.headers,
      body: {
        memberId,
        role,
      },
    });

    return { success: true, message: "Member role updated successfully" };
  },
});

export const loader = createProtectedLoader({
  permissions: {
    action: "setRole",
    subject: "Organization:Members",
  },
  paramValidation: z.object({
    memberId: z.string(),
  }),
  function: async ({ params }) => {
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }

    const { memberId } = params.data;

    const member = await prisma.member.findUnique({
      where: { id: memberId },

      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      member: {
        id: member?.id,
        name: member?.user.name ?? "",
        currentRole: member?.role,
      },
    };
  },
});

export default function MembersSetRole() {
  const { member } = useLoaderData<typeof loader>();
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
          <DialogTitle>Update Member Role</DialogTitle>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          {actionData?.fieldErrors && (
            <div className="text-destructive text-sm">
              {actionData.fieldErrors.role}
            </div>
          )}
          <input type="hidden" name="intent" value="update-role" />
          <input type="hidden" name="memberId" value={member.id} />
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              name="role"
              defaultValue={member.currentRole ?? undefined}
              className="w-full border rounded p-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Update Role</Button>
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
