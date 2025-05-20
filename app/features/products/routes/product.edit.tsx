import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, useNavigation } from "react-router";
import prisma from "~/lib/prismaClient";
import { z } from "zod";
import { productSchema } from "../components/product-form";
import { ProductForm } from "../components/product-form";
import { Header } from "~/components/header";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { getUserInformation } from "~/lib/identity.server";
import { subject } from "@casl/ability";

export async function action({ request, params }: ActionFunctionArgs) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "update", "Product");

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
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "update", "Product");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  ensureCanWithIdentity(identity, "update", subject("Product", product));

  return { product };
}

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
