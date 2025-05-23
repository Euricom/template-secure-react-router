import { useNavigate, Form, useActionData, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import prisma from "~/lib/prismaClient";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import type { OutletContext } from "./product.detail";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { getUserInformation } from "~/lib/identity.server";
import { subject } from "@casl/ability";

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { productId: string };
}) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "delete", "Product");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  ensureCanWithIdentity(identity, "delete", subject("Product", product));

  try {
    await prisma.product.delete({
      where: { id: params.productId },
    });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

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
          <p className="text-sm text-muted-foreground">
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
