import { redirect, Outlet, useNavigate } from "react-router";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";

export const loader = async ({ request }: { request: Request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  if (!session.user.role?.split(",").includes("admin")) {
    return redirect("/app");
  }
  return {};
};

export default function AdminLayout() {
  const navigate = useNavigate();

  const session = authClient.useSession();

  if (session.isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return redirect("/login");
  }

  if (session.data?.user.role?.split(",").includes("admin")) {
    return <Outlet />;
  }

  return navigate("/app");
}
