import { Link, useLoaderData } from "react-router";
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
  function: async () => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { products };
  },
});

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Products">
        <Can I="create" a="Product">
          <Button>
            <Link to="create">Create Product</Link>
          </Button>
        </Can>
      </Header>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              to={product.id}
              className="block rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <h2 className="mb-2 font-semibold text-xl">{product.name}</h2>
              <p className="text-gray-500 text-sm">Created: {formatDate(product.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
