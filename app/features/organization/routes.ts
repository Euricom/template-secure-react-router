import { relative } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const { route, layout, prefix } = relative(import.meta.dirname);

export const organizationRoutes = [
  ...prefix("/organization", [
    route("/select", "./routes/select.tsx"),
    route("/onboarding", "./routes/onboarding.tsx", [
      route("create", "./routes/onboarding.create.tsx"),
      route("join", "./routes/onboarding.join.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
