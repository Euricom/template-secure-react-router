import { redirect } from "react-router";
import z from "zod";
import { auth } from "~/lib/auth";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  formValidation: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      return { success: false, error: "Failed to update profile" };
    }
    const { name, email } = form.data;

    try {
      const activeSession = await auth.api.getSession({
        headers: request.headers,
      });

      if (!activeSession) {
        return redirect("/login");
      }

      await auth.api.updateUser({
        headers: request.headers,
        body: {
          name,
        },
      });

      if (email !== activeSession.user.email) {
        await auth.api.changeEmail({
          headers: request.headers,
          body: {
            newEmail: email,
            callbackURL: "http://localhost:5173/app/profile",
          },
        });
      }

      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("error", error);
      return { success: false, error: "Failed to update profile" };
    }
  },
});

export const loader = createProtectedLoader({
  function: async () => {
    return redirect("/app/profile");
  },
});
