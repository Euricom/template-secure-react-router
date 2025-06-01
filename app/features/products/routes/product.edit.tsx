import { redirect } from "react-router";
import { useActionData, useLoaderData, useNavigation } from "react-router";
import prisma from "~/lib/prismaClient";
import { z } from "zod";
import { productSchema } from "../components/product-form";
import { ProductForm } from "../components/product-form";
import { Header } from "~/components/header";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { subject } from "@casl/ability";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "update",
    subject: "Product",
  },
  paramValidation: z.object({
    productId: z.string(),
  }),
  function: async ({ request, params, identity }) => {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    ensureCanWithIdentity(identity, "update", subject("Product", product));

    const formData = await request.formData();
    const name = formData.get("name") as string;

    try {
      const validatedData = productSchema.parse({ name });

      await prisma.product.update({
        where: { id: params.productId },
        data: {
          name: validatedData.name,
        },
      });

      return redirect(`/app/products/${params.productId}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { errors: error.flatten().fieldErrors };
      }
      return { error: "Failed to update product" };
    }
  },
});

export const loader = createProtectedLoader({
  permissions: {
    action: "update",
    subject: "Product",
  },
  paramValidation: z.object({
    productId: z.string(),
  }),
  function: async ({ params, identity }) => {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    ensureCanWithIdentity(identity, "update", subject("Product", product));

    return { product };
  },
});

export default function EditProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Edit Product" />
      <ProductForm
        defaultValues={{ name: product.name }}
        isSubmitting={isSubmitting}
        errors={actionData?.errors}
        error={actionData?.error}
      />
    </div>
  );
}
