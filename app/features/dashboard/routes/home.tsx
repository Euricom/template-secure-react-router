import { Package } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { formatDate } from "~/lib/date";
import prisma from "~/lib/prismaClient";
import { createProtectedLoader } from "~/lib/secureRoute/";

export const loader = createProtectedLoader({
  permissions: "loggedIn",
  function: async () => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { products };
  },
});

export default function Home() {
  const { data: session } = authClient.useSession();
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Dashboard">
        <Button variant="outline" asChild>
          <Link to="/app/products/create">Create Product</Link>
        </Button>
      </Header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{products.length}</div>
            <p className="text-muted-foreground text-xs">Products in your inventory</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-xl">Recent Products</h2>
          <Button variant="outline" asChild>
            <Link to="/app/products">View All</Link>
          </Button>
        </div>
        {products.length === 0 ? (
          <p className="text-muted-foreground">
            No products found. Create your first product to get started.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <Card key={product.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Created: {formatDate(product.createdAt)}
                  </p>
                  <Button variant="link" className="mt-2 h-auto p-0" asChild>
                    <Link to={`/app/products/${product.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-xl">Session output</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
