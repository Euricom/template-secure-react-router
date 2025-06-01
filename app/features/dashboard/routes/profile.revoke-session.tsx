import { z } from "zod";
import { auth } from "~/lib/auth";
import prisma from "~/lib/prismaClient";
import { createProtectedAction } from "~/lib/secureRoute";

export const action = createProtectedAction({
  formValidation: z.object({
    sessionId: z.string(),
  }),
  function: async ({ request, form }) => {
    if (form.error) {
      return { success: false, error: "Failed to revoke session" };
    }
    const { sessionId } = form.data;

    try {
      // Fetch the session to get the token through prisma
      const sessionFromDb = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });

      if (!sessionFromDb) {
        return { success: false, error: "Session not found" };
      }

      await auth.api.revokeSession({
        headers: request.headers,
        body: {
          token: sessionFromDb.token,
        },
      });
      return { success: true, message: "Session revoked successfully" };
    } catch (error) {
      return { success: false, error: "Failed to revoke session" };
    }
  },
});
