import { useLoaderData, Link, Outlet } from "react-router";
import prisma from "~/lib/prismaClient";
import { Header } from "~/components/header";
import { formatDate } from "~/lib/date";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/product.detail";
import { auth } from "~/lib/auth";
import { ensureCan } from "~/lib/permissions.server";
import { Can } from "~/components/providers/permission.provider";
import { subject } from "@casl/ability";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await auth.api.getSession({ headers: request.headers });

  ensureCan(user?.user, "read", "Product");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }
  return { product };
}

export default function ProductDetailPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Product Details" />

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-gray-500 text-sm">ID: {product.id}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Timestamps</h3>
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

          <div className="pt-4 flex gap-4">
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
