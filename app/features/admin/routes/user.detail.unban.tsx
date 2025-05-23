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
    await prisma.user.update({
      where: { id: params.id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    return { success: false, error: "Failed to unban user" };
  }
}

export default function UserUnbanPage() {
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
        <DialogTitle>Unban User</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Unban {user.name} ({user.email}) from the platform
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Unban User
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
