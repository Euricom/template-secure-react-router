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

export async function loader({ request }: LoaderFunctionArgs) {
  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  return { organizations };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const organizationId = formData.get("organizationId") as string;

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

export default function Select() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select Organization</h1>

      <div className="grid gap-4">
        <Link
          to="/app/organization/onboarding"
          className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Other Organization
        </Link>

        {organizations.map((organization) => (
          <Form key={organization.id} method="post">
            <input type="hidden" name="organizationId" value={organization.id} />
            <button
              type="submit"
              className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {organization.name}
            </button>
          </Form>
        ))}
      </div>
    </div>
  );
}
