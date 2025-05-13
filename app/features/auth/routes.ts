import { relative } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const { route, layout } = relative(import.meta.dirname);

export const authRoutes = [
  layout("./layout.tsx", [
    route("/login", "./routes/login.tsx"),
    route("/signup", "./routes/signup.tsx"),
    route("/forgot-password", "./routes/forgot-password.tsx"),
    route("/forgot-password/validate", "./routes/forgot-password.validate.tsx"),
  ]),
  route("api/auth/*", "./routes/auth.tsx"),
] satisfies RouteConfig;
