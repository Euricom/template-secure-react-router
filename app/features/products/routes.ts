import { relative } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const { route, prefix } = relative(import.meta.dirname);

export const productsRoutes = [
  ...prefix("/products", [
    route("/", "./routes/products.tsx"),
    route("/create", "./routes/product.create.tsx"),
    route("/:productId", "./routes/product.detail.tsx", [
      route("delete", "./routes/product.detail.delete.tsx"),
    ]),
    route("/:productId/edit", "./routes/product.edit.tsx"),
  ]),
] satisfies RouteConfig;
