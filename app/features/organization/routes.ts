import { relative } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const { route, prefix } = relative(import.meta.dirname);

export const organizationRoutes = [
  ...prefix("/organization", [
    route("/select", "./routes/select.tsx"),
    route("/onboarding", "./routes/onboarding.tsx", [
      route("create", "./routes/onboarding.create.tsx"),
      route("join", "./routes/onboarding.join.tsx"),
    ]),
    route("/onboarding/join/:inviteId", "./routes/onboarding.join.byId.tsx"),
    route("/", "./routes/organization.tsx", [
      route("edit", "./routes/organization.update.tsx"),
      route("delete", "./routes/organization.delete.tsx"),
    ]),
    route("/members", "./routes/members.tsx", [
      route(":memberId/remove", "./routes/members.remove.tsx"),
      route(":memberId/set-role", "./routes/members.setRole.tsx"),
      route("invite", "./routes/members.invite.tsx"),
      route("invite/:inviteId/cancel", "./routes/members.invite.cancel.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
