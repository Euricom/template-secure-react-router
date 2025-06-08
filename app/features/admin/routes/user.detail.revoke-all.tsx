import { useEffect, useState } from "react";
import { Form, useActionData, useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import prisma from "~/lib/prismaClient";
import { createProtectedAction } from "~/lib/secureRoute/";
import type { OutletContext } from "./user.detail";

export const action = createProtectedAction({
  permissions: "loggedIn",
  paramValidation: z.object({
    id: z.string(),
  }),
  function: async ({ params }) => {
    if (params.error) {
      return { success: false, message: params.error.message };
    }
    const { id: userId } = params.data;

    try {
      // Delete all sessions for the user
      await prisma.session.deleteMany({
        where: { userId },
      });

      return { success: true, message: "All sessions revoked successfully" };
    } catch (error) {
      console.error("error", error);
      return { success: false, error: "Failed to revoke sessions" };
    }
  },
});

export default function UserRevokeAllSessionsPage() {
  const { user } = useOutletContext<OutletContext>();
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
        <DialogTitle>Revoke All Sessions</DialogTitle>
        <div className="grid gap-2">
          <p className="text-muted-foreground text-sm">
            Are you sure you want to revoke all sessions for {user.name} ({user.email})? This will
            log them out of all devices.
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Revoke All Sessions
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
