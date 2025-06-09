import { redirect } from "react-router";
import { auth } from "~/lib/auth";
import logger from "~/lib/logging/logger.server";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute/";

export const action = createProtectedAction({
  permissions: "loggedIn",
  function: async ({ request, identity }) => {
    try {
      await auth.api.deleteUser({
        headers: request.headers,
        body: {
          // TODO: Move to env
          callbackURL: "http://localhost:5173/goodbye", // Some auth providers require password confirmation
        },
      });
      return {
        success: true,
        message: "Account deletion request sent to your email",
      };
    } catch (error) {
      logger.error(identity, "Failed to delete account", { error });
      return { success: false, error: "Failed to delete account" };
    }
  },
});

export const loader = createProtectedLoader({
  permissions: "loggedIn",
  function: async () => {
    return redirect("/app/profile");
  },
});
