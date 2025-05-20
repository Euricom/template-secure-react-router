import { useLoaderData, Outlet, Link } from "react-router";
import { DataTable } from "~/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "~/lib/date";
import { Badge } from "~/components/ui/badge";
import { Header } from "~/components/header";
import prisma from "~/lib/prismaClient";
import { Button } from "~/components/ui/button";
import type { LoaderFunctionArgs } from "react-router";
import { ensureCanWithIdentity } from "~/lib/permissions.server";
import { getUserInformation } from "~/lib/identity.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const identity = await getUserInformation(request);

  ensureCanWithIdentity(identity, "read", "Organization:Members");

  // Members (joined users)
  const members = await prisma.member.findMany({
    where: { organizationId: identity.organization.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  // Invitations (pending)
  const invitations = await prisma.invitation.findMany({
    where: { organizationId: identity.organization.id, status: "pending" },
    orderBy: [{ expiresAt: "desc" }],
  });
  return {
    members: members.map((m) => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      status: "active",
      joinedAt: m.createdAt,
      invitedAt: null,
      userId: m.userId,
      type: "member" as const,
    })),
    invitations: invitations.map((i) => ({
      id: i.id,
      name: null,
      email: i.email,
      role: i.role ?? "user",
      status: "invited",
      joinedAt: null,
      invitedAt: i.expiresAt,
      type: "invite" as const,
    })),
  };
}

export default function MembersPage() {
  const { members, invitations } = useLoaderData<typeof loader>();

  const data = [...members, ...invitations];

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) =>
        row.original.name || <span className="italic text-muted-foreground">(invited)</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "active" ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="outline">Invited</Badge>
        ),
    },
    {
      accessorKey: "joinedAt",
      header: "Joined/Invited",
      cell: ({ row }) => formatDate(row.original.joinedAt ?? row.original.invitedAt ?? new Date()),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.type === "member") {
          return (
            <div className="flex gap-2">
              <Link to={`/app/organization/members/${row.original.id}/remove`}>
                <Button variant="destructive" size="sm">
                  Remove
                </Button>
              </Link>
              <Link to={`/app/organization/members/${row.original.id}/set-role`}>
                <Button variant="outline" size="sm">
                  Update Role
                </Button>
              </Link>
            </div>
          );
        } else {
          return (
            <div className="flex gap-2">
              <Link to={`/app/organization/members/invite/${row.original.id}/cancel`}>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </Link>
            </div>
          );
        }
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Organization Members">
        <Link to="/app/organization/members/invite">
          <Button>Invite Member</Button>
        </Link>
      </Header>
      <DataTable columns={columns} data={data} searchColumn="email" />
      <Outlet />
    </div>
  );
}
