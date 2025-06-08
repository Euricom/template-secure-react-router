import { Outlet, useLoaderData, useNavigate } from "react-router";
import { Link } from "react-router";
import { z } from "zod";
import { Header } from "~/components/header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { RecentSessions } from "~/features/admin/components/recent-sessions";
import { authClient } from "~/lib/auth-client";
import { formatDate } from "~/lib/date";
import prisma from "~/lib/prismaClient";
import { createProtectedLoader } from "~/lib/secureRoute/";

export const loader = createProtectedLoader({
  permissions: "loggedIn",
  paramValidation: z.object({
    id: z.string(),
  }),
  function: async ({ params }) => {
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }
    const { id } = params.data;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!user) {
      throw new Response("User not found", { status: 404 });
    }

    return {
      user: {
        ...user,
        role: user.role ? user.role.split(",").map((role) => role.trim()) : null,
      },
    };
  },
});

export default function UserDetailPage() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="User Details" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic information about the user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Status:</span>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                  {user.role && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Roles:</span>
                      <div className="flex items-center gap-1">
                        {user.role.map((role) => (
                          <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Email Verified</span>
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Created At</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Last Updated</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(user.updatedAt)}
                  </span>
                </div>
              </div>

              {user.banned && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Ban Reason</span>
                      <span className="text-muted-foreground text-sm">{user.banReason}</span>
                    </div>
                    {user.banExpires && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Ban Expires</span>
                        <span className="text-muted-foreground text-sm">
                          {formatDate(user.banExpires)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <RecentSessions sessions={user.sessions} userId={user.id} />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await authClient.admin.impersonateUser({ userId: user.id });
              navigate(0);
            }}
          >
            Impersonate User
          </Button>
          {user.banned ? (
            <Link to="unban">
              <Button variant="default">Unban User</Button>
            </Link>
          ) : (
            <Link to="ban">
              <Button variant="destructive">Ban User</Button>
            </Link>
          )}
          <Link to="set-role">
            <Button variant="outline">Set Role</Button>
          </Link>
          <Link to="delete">
            <Button variant="destructive">Delete User</Button>
          </Link>
        </div>
      </div>

      <Outlet context={{ user } satisfies OutletContext} />
    </div>
  );
}

export interface OutletContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: string[] | null;
    banned: boolean | null;
    emailVerified: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    banReason: string | null;
    banExpires: Date | null;
    sessions: {
      id: string;
      createdAt: Date;
      expiresAt: Date | null;
      ipAddress: string | null;
      userAgent: string | null;
    }[];
  };
}
