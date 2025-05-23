import {
  useNavigate,
  Form,
  useActionData,
  useLocation,
  useOutletContext,
  useParams,
} from "react-router";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import prisma from "~/lib/prismaClient";
import { DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import { auth } from "~/lib/auth";
import type { OutletContext } from "./user.detail";

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { sessionId: string };
}) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      throw new Response("Session not found", { status: 404 });
    }

    await auth.api.revokeUserSession({
      headers: request.headers,
      body: {
        sessionToken: session.token,
      },
    });

    return { success: true, message: "Session revoked successfully" };
  } catch (error) {
    return { success: false, error: "Failed to revoke session" };
  }
}

export default function UserRevokeSessionPage() {
  const { user } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const params = useParams();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      navigateToParent();
    }
  }, [actionData, navigate, location.pathname]);

  function navigateToParent() {
    setOpen(false);
    navigate(-1);
  }

  const session = user.sessions.find((session) => session.id === params.sessionId);

  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <Dialog open={open} onOpenChange={navigateToParent}>
      <DialogContent>
        <DialogTitle>Revoke Session</DialogTitle>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to revoke this session for {user.name} ({user.email})?
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Device:</span> {session.userAgent || "Unknown device"}
            </p>
            <p className="text-sm">
              <span className="font-medium">IP Address:</span> {session.ipAddress || "Unknown"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Created:</span>{" "}
              {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Form method="post" className="grid gap-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateToParent}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Revoke Session
              </Button>
            </div>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
