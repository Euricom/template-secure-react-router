import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useActionData, useNavigation } from "react-router";
import prisma from "~/lib/prismaClient";
import { z } from "zod";
import { productSchema } from "../components/product-form";
import { ProductForm } from "../components/product-form";
import { Header } from "~/components/header";
import { auth } from "~/lib/auth";
import { ensureCan } from "~/lib/permissions.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return redirect("/app/products");
  }

  ensureCan(session.user, "create", "Product");

  try {
    const validatedData = productSchema.parse({ name });

    await prisma.product.create({
      data: {
        name: validatedData.name,
        user: {
          connect: {
            id: session.user.id,
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
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.api.getSession({ headers: request.headers });
  ensureCan(user?.user, "create", "Product");

  return;
}

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
