import { useEffect, useState } from "react";
import { Form, useActionData, useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { auth } from "~/lib/auth";
import { createProtectedAction } from "~/lib/secureRoute";
import type { OutletContext } from "./user.detail";

export const action = createProtectedAction({
  paramValidation: z.object({
    id: z.string(),
  }),
  formValidation: z.object({
    roles: z.array(z.enum(["user", "admin"])).min(1, "At least one role is required"),
  }),
  function: async ({ request, params, form }) => {
    if (params.error) {
      return { success: false, message: params.error.message };
    }
    const { id: userId } = params.data;

    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    const { roles } = form.data;

    await auth.api.setRole({
      headers: request.headers,
      body: {
        userId,
        role: roles,
      },
    });

    return { success: true, message: "User roles updated successfully" };
  },
});

export default function UserSetRolePage() {
  const { user } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [roles, setRoles] = useState<string[]>(user.role || ["user"]);

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

  const toggleRole = (role: string) => {
    setRoles((currentRoles) => {
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter((r) => r !== role)
        : [...currentRoles, role];

      if (newRoles.length === 0) {
        toast.error("A user must have at least one role");
        return currentRoles;
      }

      return newRoles;
    });
  };

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Set User Roles</DialogTitle>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-sm">
            Set the roles for {user.name} ({user.email})
          </p>
          <div className="grid gap-2">
            <Label>Roles</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="user-role"
                  checked={roles.includes("user")}
                  onCheckedChange={() => toggleRole("user")}
                />
                <label
                  htmlFor="user-role"
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  User
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-role"
                  checked={roles.includes("admin")}
                  onCheckedChange={() => toggleRole("admin")}
                />
                <label
                  htmlFor="admin-role"
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Admin
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            {roles.map((role) => (
              <input key={role} type="hidden" name="roles" value={role} />
            ))}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Update Roles
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
