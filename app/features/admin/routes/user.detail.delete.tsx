import { useNavigate, Form, useActionData, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import prisma from "~/lib/prismaClient";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import type { OutletContext } from "./user.detail";
import { createProtectedAction } from "~/lib/secureRoute";
import { z } from "zod";

export const action = createProtectedAction({
  paramValidation: z.object({
    id: z.string(),
  }),
  function: async ({ params }) => {
    try {
      await prisma.user.delete({
        where: { id: params.id },
      });

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      return { success: false, error: "Failed to delete user" };
    }
  },
});

export default function UserDeletePage() {
  const { user } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      navigate("/app/admin/users");
    }
  }, [actionData, navigate]);

  function navigateToParent() {
    setOpen(false);
    navigate(-1);
  }

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Delete User</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {user.name} ({user.email})? This action cannot be
            undone.
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Delete User
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
