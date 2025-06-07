import { adminClient, customSessionClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>(), adminClient(), organizationClient()],
});

export type Session = typeof authClient.$Infer.Session;
