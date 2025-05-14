import { Form, redirect, useLoaderData, type ActionFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { auth } from "~/lib/auth";
import type { Route } from "./+types/onboarding.join.byId";

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const inviteId = params.inviteId;

  if (!session) {
    return redirect("/login");
  }

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
}

export async function loader({ params, request }: Route.LoaderArgs) {
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
}

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
