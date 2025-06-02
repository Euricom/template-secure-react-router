import { redirect } from "react-router";
import { auth } from "~/lib/auth";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  function: async ({ request }) => {
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
      return { success: false, error: "Failed to delete account" };
    }
  },
});

export const loader = createProtectedLoader({
  function: async () => {
    return redirect("/app/profile");
  },
});
