import { Plus } from "lucide-react";
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { auth } from "~/lib/auth";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const organizationId = formData.get("organizationId") as string;

  // TODO: add form validation

  if (organizationId) {
    // Set active organization
    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId,
      },
    });
  }

  return redirect("/app");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  return { organizations };
}

export default function Select() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogTitle>Select Organization</AlertDialogTitle>
        <div className="grid gap-4">
          <Link
            to="/app/organization/onboarding"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
          >
            <Plus className="h-5 w-5" />
            Add Other Organization
          </Link>

          {organizations.map((organization) => (
            <Form key={organization.id} method="post">
              <input type="hidden" name="organizationId" value={organization.id} />
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
              >
                {organization.name}
              </button>
            </Form>
          ))}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
