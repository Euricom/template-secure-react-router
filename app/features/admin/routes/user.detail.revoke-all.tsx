import { useNavigate, Form, useActionData, useLocation, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import prisma from "~/lib/prismaClient";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import type { OutletContext } from "./user.detail";

export async function action({ params }: { params: { id: string } }) {
  try {
    // Delete all sessions for the user
    await prisma.session.deleteMany({
      where: { userId: params.id },
    });

    return { success: true, message: "All sessions revoked successfully" };
  } catch (error) {
    return { success: false, error: "Failed to revoke sessions" };
  }
}

export default function UserRevokeAllSessionsPage() {
  const { user } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      navigateToParent();
    }
  }, [actionData, navigate, location.pathname]);

  function navigateToParent() {
    setOpen(false);
    navigate(-1);
  }

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Revoke All Sessions</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
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
