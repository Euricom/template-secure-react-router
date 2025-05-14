import { Form, redirect, useLoaderData } from "react-router";

import { DialogClose, DialogFooter, DialogHeader } from "~/components/ui/dialog";

import { DialogContent } from "~/components/ui/dialog";

import { useEffect } from "react";
import { DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useActionData } from "react-router";
import { toast } from "sonner";
import { Dialog } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import prisma from "~/lib/prismaClient";
import { auth } from "~/lib/auth";
import type { Route } from "./+types/members";

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { memberId: string };
}) {
  const user = await auth.api.getSession({ headers: request.headers });
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const role = formData.get("role") as string;

  if (role !== "admin" && role !== "member" && role !== "owner") {
    return { success: false, error: "Invalid role" };
  }

  await auth.api.updateMemberRole({
    headers: request.headers,
    body: {
      memberId: params.memberId,
      role,
    },
  });

  return { success: true, message: "Member role updated successfully" };
}

export async function loader({ params }: Route.LoaderArgs) {
  const memberId = params.memberId;
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
}

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
  }, [actionData, navigate]);

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
          {actionData?.error && <div className="text-destructive text-sm">{actionData.error}</div>}
          <input type="hidden" name="intent" value="update-role" />
          <input type="hidden" name="memberId" value={member.id} />
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
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
