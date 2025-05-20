import { useLoaderData, Link, type LoaderFunctionArgs } from "react-router";
import prisma from "~/lib/prismaClient";
import { Header } from "~/components/header";
import { formatDate } from "~/lib/date";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { Button } from "~/components/ui/button";
import { Can } from "~/components/providers/permission.provider";
import { getUserInformation } from "~/lib/identity.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const identity = await getUserInformation(request);
  ensureCanWithIdentity(identity, "read", "Product");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { products };
}

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
