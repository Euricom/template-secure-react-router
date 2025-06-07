import { relative } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

const { route, index } = relative(import.meta.dirname);

export const dashboardRoutes = [
  index("./routes/home.tsx"),
  route("/profile", "./routes/profile.tsx", [
    route("delete", "./routes/profile.delete.tsx"),
    route("revoke-session", "./routes/profile.revoke-session.tsx"),
    route("update", "./routes/profile.update.tsx"),
  ]),
] satisfies RouteConfig;
