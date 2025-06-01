import { Form, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { auth } from "~/lib/auth";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

export const action = createProtectedAction({
  permissions: {
    action: "accept",
    subject: "Organization:Members:Invite",
  },
  function: async ({ request, params }) => {
    const inviteId = params.inviteId;

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
      return { error: "Failed to join organization" };
    }
  },
});

// TODO: Validate params first
export const loader = createProtectedLoader({
  permissions: {
    action: "accept",
    subject: "Organization:Members:Invite",
  },
  function: async ({ params, request }) => {
    const inviteId = params.inviteId;

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
