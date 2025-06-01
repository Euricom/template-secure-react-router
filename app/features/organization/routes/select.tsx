import {
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  Form,
  Link,
  redirect,
} from "react-router";
import { auth } from "~/lib/auth";
import { Plus } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "~/components/ui/alert-dialog";

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
            className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Other Organization
          </Link>

          {organizations.map((organization) => (
            <Form key={organization.id} method="post">
              <input type="hidden" name="organizationId" value={organization.id} />
              <button
                type="submit"
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
