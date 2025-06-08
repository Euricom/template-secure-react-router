import { ArrowLeft } from "lucide-react";
import { Link, type LoaderFunctionArgs, Outlet, useLoaderData, useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  return { hasOrganizations: organizations.length > 0 };
}

export default function Onboarding() {
  const { hasOrganizations } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row gap-2">
          <div className="flex flex-col gap-2">
            <AlertDialogTitle>Onboarding</AlertDialogTitle>
            <AlertDialogDescription>
              Get started by creating a new organization or joining an existing one.
            </AlertDialogDescription>
          </div>
          {hasOrganizations && (
            <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Link to="/app/organization/onboarding/create">
            <Button className="w-full">Create a new organization</Button>
          </Link>
          <Link to="/app/organization/onboarding/join">
            <Button variant="secondary" className="w-full">
              Join an existing organization
            </Button>
          </Link>
        </div>
        <AlertDialogFooter />
        <div className="pt-2">
          <Outlet />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
