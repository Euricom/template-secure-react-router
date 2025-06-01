import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { DataTable } from "~/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "~/lib/date";
import { Badge } from "~/components/ui/badge";
import { useState, useEffect } from "react";
import { auth } from "~/lib/auth";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  Form,
  useActionData,
} from "react-router";
import { authClient } from "~/lib/auth-client";
import prisma from "~/lib/prismaClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { createProtectedAction, createProtectedLoader } from "~/lib/secureRoute";

type Session = {
  id: string;
  userAgent: string;
  createdAt: Date;
  isCurrent: boolean;
};

export const action = createProtectedAction({
  function: async ({ request }) => {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const intent = formData.get("intent") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (intent === "revoke-session" && sessionId) {
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
    }

    if (intent === "update-profile" && name && email) {
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
        return { success: false, error: "Failed to update profile" };
      }
    }

    if (intent === "delete-account") {
      try {
        await auth.api.deleteUser({
          headers: request.headers,
          body: {
            callbackURL: "http://localhost:5173/goodbye", // Some auth providers require password confirmation
          },
        });
        return { success: true, message: "Account deletion request sent to your email" };
      } catch (error) {
        return { success: false, error: "Failed to delete account" };
      }
    }

    return { success: false, error: "Invalid action" };
  },
});

export const loader = createProtectedLoader({
  function: async ({ request, identity }) => {
    const sessions = await auth.api.listSessions({
      headers: request.headers,
    });

    return {
      user: {
        name: identity.user.name,
        email: identity.user.email,
      },
      sessions: sessions.map(
        (session): Session => ({
          id: session.id,
          userAgent: session.userAgent ?? "",
          createdAt: session.createdAt,
          isCurrent: session.id === identity.session.session.id,
        })
      ),
    };
  },
});

export default function ProfilePage() {
  const { user, sessions } = useLoaderData<typeof loader>();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const actionData = useActionData<typeof action>();

  // Show toast notifications when action data changes
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
      } else if (actionData.error) {
        toast.error(actionData.error);
      }
    }
  }, [actionData]);

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "userAgent",
      header: "User Agent",
      enableSorting: true,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-2">
            {session.userAgent}
            {session.isCurrent && <Badge variant="secondary">Current</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      enableSorting: true,
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return formatDate(date);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            disabled={session.isCurrent}
            onClick={() => setSessionToRevoke(session)}
          >
            End Session
          </Button>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <AlertDialog
        open={!!sessionToRevoke}
        onOpenChange={(open: boolean) => !open && setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this session? This will log out the device associated
              with this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Form method="post">
              <input type="hidden" name="sessionId" value={sessionToRevoke?.id} />
              <input type="hidden" name="intent" value="revoke-session" />
              <div className="flex gap-2">
                <AlertDialogCancel asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" type="submit">
                    End Session
                  </Button>
                </AlertDialogAction>
              </div>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open: boolean) => !open && setShowDeleteDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. All your
              data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Form method="post">
              <input type="hidden" name="intent" value="delete-account" />
              <div className="flex gap-2">
                <AlertDialogCancel asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" type="submit">
                    Delete Account
                  </Button>
                </AlertDialogAction>
              </div>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <Separator className="my-4" />

            <Form method="post">
              <input type="hidden" name="intent" value="update-profile" />
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={user.name} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button
                  variant="outline"
                  disabled={isResettingPassword}
                  onClick={async () => {
                    try {
                      setIsResettingPassword(true);
                      setError(null);

                      await authClient.forgetPassword(
                        {
                          email: user.email,
                          redirectTo: "http://localhost:5173/forgot-password/validate",
                        },
                        {
                          onRequest: () => {
                            setIsResettingPassword(true);
                          },
                          onSuccess: () => {
                            setIsResettingPassword(false);
                            toast.success(
                              "Password reset instructions have been sent to your email."
                            );
                          },
                          onError: (ctx) => {
                            setError(
                              ctx.error.message ||
                                "Failed to request password reset. Please try again."
                            );
                            setIsResettingPassword(false);
                          },
                        }
                      );
                    } catch (err) {
                      setError("An unexpected error occurred. Please try again.");
                      setIsResettingPassword(false);
                    }
                  }}
                >
                  {isResettingPassword ? "Sending reset link..." : "Reset Password"}
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </Form>
            <div className="mt-6">
              <Separator className="my-4" />
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage your active sessions across different devices</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <DataTable columns={columns} data={sessions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
