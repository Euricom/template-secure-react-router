import { redirect, Outlet, useNavigate, useLoaderData } from "react-router";
import { auth } from "~/lib/auth";

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
  return { session };
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { session } = useLoaderData<typeof loader>();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role?.split(",").includes("admin")) {
    return <Outlet />;
  }

  return navigate("/app");
}
