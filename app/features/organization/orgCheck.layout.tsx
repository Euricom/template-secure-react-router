/**
 * Organization Check Layout
 *
 * Security considerations:
 * 1. Authentication:
 *    - Session validation
 *    - Redirect to login if not authenticated
 *    - Secure session handling
 *
 * 2. Organization Access:
 *    - Organization membership verification
 *    - Active organization validation
 *    - Organization selection flow
 */

import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { auth } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return redirect("/login");
  }

  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  const pathname = new URL(request.url).pathname;
  // Allow organization selection and onboarding paths
  if (
    pathname === "/app/organization/select" ||
    pathname.startsWith("/app/organization/onboarding")
  ) {
    return { activeOrg: { name: "Select Organization", slug: "select" } };
  }

  // Enforce organization creation for new users
  if (organizations.length === 0) {
    return redirect("/app/organization/onboarding");
  }

  // Auto-select organization if user has only one
  if (organizations.length === 1) {
    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId: organizations[0].id,
      },
    });
    session =
      (await auth.api.getSession({
        headers: request.headers,
      })) ?? session;
  }

  if (!session.session.activeOrganizationId) {
    return redirect("/app/organization/select");
  }

  const activeOrg = organizations.find((org) => org.id === session.session.activeOrganizationId);

  if (!activeOrg) {
    return redirect("/app/organization/select");
  }

  return { activeOrg: { name: activeOrg.name, slug: activeOrg.slug } };
}

export default function OrgCheckLayout() {
  const { activeOrg } = useLoaderData<typeof loader>();

  return (
    <div>
      <Outlet context={{ activeOrg }} />
    </div>
  );
}

export type ActiveOrg = {
  name: string;
  slug: string;
};
