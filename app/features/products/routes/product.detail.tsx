import { subject } from "@casl/ability";
import { Link, Outlet, useLoaderData } from "react-router";
import z from "zod";
import { Header } from "~/components/header";
import { Can } from "~/components/providers/permission.provider";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/lib/date";
import prisma from "~/lib/prismaClient";
import { createProtectedLoader } from "~/lib/secureRoute/";

export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "Product",
  },
  paramValidation: z.object({
    productId: z.string(),
  }),
  function: async ({ params }) => {
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
    return { product };
  },
});

export default function ProductDetailPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Product Details" />

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-2xl">{product.name}</h2>
            <p className="text-gray-500 text-sm">ID: {product.id}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-lg">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p>{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild variant="outline">
              <Link to="/app/products">Back to Products</Link>
            </Button>

            <Can I="update" this={subject("Product", product)}>
              <Button asChild>
                <Link to={`/app/products/${product.id}/edit`}>Edit Product</Link>
              </Button>
            </Can>
            <Can I="delete" this={subject("Product", product)}>
              <Button asChild variant="destructive">
                <Link to="delete">Delete Product</Link>
              </Button>
            </Can>
          </div>
        </div>
      </div>

      <Outlet context={{ product } satisfies OutletContext} />
    </div>
  );
}

export interface OutletContext {
  product: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
