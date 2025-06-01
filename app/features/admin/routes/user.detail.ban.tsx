import { useNavigate, Form, useActionData, useLocation, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { useState, useEffect } from "react";
import type { OutletContext } from "./user.detail";
import { createProtectedAction } from "~/lib/secureRoute";

const banSchema = z.object({
  banReason: z.string().min(1, "Ban reason is required").max(500, "Ban reason is too long"),
  banExpires: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      },
      { message: "Ban expiration date must be in the future" }
    ),
});

export const action = createProtectedAction({
  paramValidation: z.object({
    id: z.string(),
  }),
  function: async ({ request, params }) => {
    try {
      const formData = await request.formData();
      const banData = {
        banReason: formData.get("banReason") as string,
        banExpires: formData.get("banExpires") as string,
      };

      const validatedData = banSchema.parse(banData);

      // Calculate ban duration in seconds
      const banExpiresIn = validatedData.banExpires
        ? Math.floor((new Date(validatedData.banExpires).getTime() - Date.now()) / 1000)
        : undefined;

      await auth.api.banUser({
        headers: request.headers,
        body: {
          userId: params.id,
          banReason: validatedData.banReason,
          banExpiresIn,
        },
      });

      return { success: true, message: "User banned successfully" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation failed",
          fieldErrors: error.flatten().fieldErrors,
        };
      }
      return { success: false, error: "Failed to ban user" };
    }
  },
});

export default function UserBanPage() {
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
        <DialogTitle>Ban User</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Ban {user.name} ({user.email}) from the platform
          </p>
        </div>

        <Form method="post" className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="banReason">Ban Reason</Label>
            <Input id="banReason" name="banReason" placeholder="Enter ban reason" required />
            {actionData?.fieldErrors?.banReason && (
              <p className="text-sm text-destructive">{actionData.fieldErrors.banReason[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="banExpires">Ban Expires (optional)</Label>
            <Input
              id="banExpires"
              name="banExpires"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
            />
            {actionData?.fieldErrors?.banExpires && (
              <p className="text-sm text-destructive">{actionData.fieldErrors.banExpires[0]}</p>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Ban User
              </Button>
            </div>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
