import { relative } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

const { route, prefix, layout } = relative(import.meta.dirname);

export const adminRoutes = [
  ...prefix("/admin", [
    layout("./layout.tsx", [
      route("/users", "./routes/users.tsx"),
      route("/users/:id", "./routes/user.detail.tsx", [
        route("ban", "./routes/user.detail.ban.tsx"),
        route("unban", "./routes/user.detail.unban.tsx"),
        route("delete", "./routes/user.detail.delete.tsx"),
        route("revoke-all", "./routes/user.detail.revoke-all.tsx"),
        route("revoke/:sessionId", "./routes/user.detail.revoke.tsx"),
        route("set-role", "./routes/user.detail.set-role.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
