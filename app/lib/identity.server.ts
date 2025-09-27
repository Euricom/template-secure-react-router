import { auth } from "./auth";
import prisma from "./prismaClient";

export const getSession = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response("Unauthorized", { status: 401 });
  return session;
};

type BaseIdentity = {
  user: {
    id: string;
    role?: string | null;
    [key: string]: unknown;
  };
  session: {
    [key: string]: unknown;
  };
  member: {
    id: string;
    role: string;
    [key: string]: unknown;
  } | null;
};

export type IdentityWithOrganization = BaseIdentity & {
  organization: {
    id: string;
    role: string;
  };
};

export type IdentityWithoutOrganization = BaseIdentity;

export const getUserInformation = async (
  request: Request,
  includeOrganization = true
): Promise<IdentityWithOrganization | IdentityWithoutOrganization> => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response("Unauthorized", { status: 401 });

  if (!includeOrganization) {
    return {
      user: session.user,
      session: session,
      member: null,
    };
  }

  const orgId = session.session.activeOrganizationId;
  if (!orgId) throw new Response("No active organization", { status: 401 });

  const member = await prisma.member.findFirst({
    where: {
      AND: [{ userId: session.user.id }, { organizationId: orgId }],
    },
  });
  if (!member)
    throw new Response("User is not a member of the organization", {
      status: 400,
    });

  return {
    user: session.user,
    session: session,
    member: member,
    organization: {
      id: orgId,
      role: member.role,
    },
  };
};
