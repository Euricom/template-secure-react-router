import { type LoaderFunctionArgs, Outlet, redirect } from "react-router";
import { auth } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (session) {
    return redirect("/app");
  }
  return {};
}

export default function AuthLayout() {
  return <Outlet />;
}
