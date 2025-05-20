import { auth } from "./auth";
import prisma from "./prismaClient";

export const getSession = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response("Unauthorized", { status: 401 });
  return session;
};

export const getUserInformation = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response("Unauthorized", { status: 401 });

  const orgId = session.session.activeOrganizationId;
  if (!orgId) throw new Response("No active organization", { status: 400 });

  const member = await prisma.member.findFirst({
    where: {
      AND: [{ userId: session.user.id }, { organizationId: orgId }],
    },
  });
  if (!member) throw new Response("User is not a member of the organization", { status: 400 });

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
