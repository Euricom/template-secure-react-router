import { Form, redirect, useLoaderData } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/lib/auth";
import logger from "~/lib/logging/logger.server";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute/";

export const action = createProtectedAction({
  permissions: {
    action: "accept",
    subject: "Organization:Members:Invite",
  },
  paramValidation: z.object({
    inviteId: z.string(),
  }),
  function: async ({ request, params, identity }) => {
    if (params.error) {
      return { error: "Failed to join organization" };
    }

    const { inviteId } = params.data;

    if (!inviteId) {
      return redirect("/app");
    }

    try {
      const invite = await auth.api.getInvitation({
        headers: request.headers,
        query: {
          id: inviteId,
        },
      });

      if (!invite) {
        return redirect("/app");
      }

      await auth.api.acceptInvitation({
        headers: request.headers,
        body: {
          invitationId: invite.id,
        },
      });

      await auth.api.setActiveOrganization({
        headers: request.headers,
        body: {
          organizationId: invite.organizationId,
        },
      });

      return redirect("/app");
    } catch (error) {
      logger.error(identity, "Failed to join organization", { error });
      return { error: "Failed to join organization" };
    }
  },
});

export const loader = createProtectedLoader({
  permissions: {
    action: "accept",
    subject: "Organization:Members:Invite",
  },
  paramValidation: z.object({
    inviteId: z.string(),
  }),
  function: async ({ params, request }) => {
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }

    const { inviteId } = params.data;

    if (!inviteId) {
      return redirect("/app");
    }

    const invite = await auth.api.getInvitation({
      headers: request.headers,
      query: {
        id: inviteId,
      },
    });

    return {
      invite,
    };
  },
});

export default function OnboardingJoin() {
  const { invite } = useLoaderData<typeof loader>();

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Join {invite.organizationName}</CardTitle>
        <CardDescription>
          You have been invited to join {invite.organizationName}. Do you want to join?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <Button type="submit">Join</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
