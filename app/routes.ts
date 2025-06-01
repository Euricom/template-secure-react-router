import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { adminRoutes } from "./features/admin/routes";
import { productsRoutes } from "./features/products/routes";
import { authRoutes } from "./features/auth/routes";
import { organizationRoutes } from "./features/organization/routes";
import { dashboardRoutes } from "./features/dashboard/routes";

export default [
  index("./features/marketing/routes/landing.tsx"),
  route("/goodbye", "./features/marketing/routes/goodbye.tsx"),

  // Auth routes
  ...authRoutes,

  // Dashboard routes
  layout("./features/organization/orgCheck.layout.tsx", [
    layout("./features/dashboard/layout.tsx", [
      ...prefix("/app", [
        // General routes
        ...dashboardRoutes,
        ...organizationRoutes,
        ...productsRoutes,
        ...adminRoutes,
      ]),
    ]),
  ]),
] satisfies RouteConfig;
