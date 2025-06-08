import { subject } from "@casl/ability";
import { useEffect, useState } from "react";
import { Form, useActionData, useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import prisma from "~/lib/prismaClient";
import { createProtectedAction } from "~/lib/secureRoute/";
import type { OutletContext } from "./product.detail";

export const action = createProtectedAction({
  permissions: {
    action: "delete",
    subject: "Product",
  },
  paramValidation: z.object({
    productId: z.string(),
  }),
  function: async ({ params, identity }) => {
    if (params.error) {
      return { success: false, message: params.error.message };
    }
    const { productId } = params.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    ensureCanWithIdentity(identity, "delete", subject("Product", product));

    try {
      await prisma.product.delete({
        where: { id: productId },
      });

      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      console.error("error", error);
      return { success: false, error: "Failed to delete product" };
    }
  },
});

export default function ProductDelete() {
  const { product } = useOutletContext<OutletContext>();
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
        <DialogTitle>Delete Product</DialogTitle>
        <div className="grid gap-2">
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Delete Product
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
