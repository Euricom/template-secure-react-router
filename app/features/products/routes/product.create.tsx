import { redirect } from "react-router";
import { useActionData, useNavigation } from "react-router";
import prisma from "~/lib/prismaClient";
import { z } from "zod";
import { productSchema } from "../components/product-form";
import { ProductForm } from "../components/product-form";
import { Header } from "~/components/header";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "create",
    subject: "Product",
  },
  function: async ({ request, identity }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;

    try {
      const validatedData = productSchema.parse({ name });

      await prisma.product.create({
        data: {
          name: validatedData.name,
          user: {
            connect: {
              id: identity.user.id,
            },
          },
        },
      });

      return redirect("/app/products");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { errors: error.flatten().fieldErrors };
      }
      return { error: "Failed to create product" };
    }
  },
});

export const loader = createProtectedLoader({
  permissions: {
    action: "create",
    subject: "Product",
  },
  function: async () => {
    return;
  },
});

export default function CreateProductPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Create New Product" />
      <ProductForm
        isSubmitting={isSubmitting}
        errors={actionData?.errors}
        error={actionData?.error}
      />
    </div>
  );
}
