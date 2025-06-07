import { Link, useLoaderData } from "react-router";
import { Header } from "~/components/header";
import { Can } from "~/components/providers/permission.provider";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/lib/date";
import prisma from "~/lib/prismaClient";
import { createProtectedLoader } from "~/lib/secureRoute";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={product.id}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-500 text-sm">Created: {formatDate(product.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
