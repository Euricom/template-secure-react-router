import { subject } from "@casl/ability";
import { redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";
import { Header } from "~/components/header";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import prisma from "~/lib/prismaClient";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute/";
import { ProductForm, productSchema } from "../components/product-form";

export const action = createProtectedAction({
  permissions: {
    action: "update",
    subject: "Product",
  },
  paramValidation: z.object({
    productId: z.string(),
  }),
  formValidation: z.object({
    name: z.string().min(1, "Name is required"),
  }),
  function: async ({ params, identity, form }) => {
    if (params.error) {
      return { error: "Failed to update product" };
    }
    const { productId } = params.data;

    if (form.error) {
      return {
        error: "Failed to update product",
        fieldErrors: form.fieldErrors,
      };
    }
    const { name } = form.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    ensureCanWithIdentity(identity, "update", subject("Product", product));

    try {
      const validatedData = productSchema.parse({ name });

      await prisma.product.update({
        where: { id: productId },
        data: {
          name: validatedData.name,
        },
      });

      return redirect(`/app/products/${productId}`);
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
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }

    const { productId } = params.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
