import { Form, redirect, useLoaderData } from "react-router";

import { DialogFooter } from "~/components/ui/dialog";

import { DialogContent } from "~/components/ui/dialog";

import { useEffect } from "react";
import { DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { useActionData } from "react-router";
import { toast } from "sonner";
import { Dialog } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import prisma from "~/lib/prismaClient";
import { auth } from "~/lib/auth";
import type { Route } from "./+types/members";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { getUserInformation } from "~/lib/identity.server";

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { memberId: string; organizationId: string };
}) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "remove", "Organization:Members");

  await auth.api.removeMember({
    headers: request.headers,
    body: {
      memberIdOrEmail: params.memberId,
      organizationId: params.organizationId,
    },
  });

  return { success: true, message: "Member removed successfully" };
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "remove", "Organization:Members");

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
    },
  };
}

export default function MembersRemove() {
  const { member } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      navigate("/app/products");
    }
  }, [actionData, navigate]);

  function navigateToParent() {
    setOpen(false);
    navigate(-1);
  }

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Remove Member</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove "{member.name}"?
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Remove Member
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
