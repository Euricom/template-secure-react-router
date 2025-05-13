import { redirect, type ActionFunctionArgs } from "react-router";
import { useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return redirect("/app/organization");
  }

  try {
    const validatedData = onboardingSchema.parse({ name });

    const slug = validatedData.name.toLowerCase().replace(/ /g, "-");

    const isSlugAvailable = await auth.api.checkOrganizationSlug({
      headers: request.headers,
      body: {
        slug,
      },
    });

    if (!isSlugAvailable) {
      return { error: "Organization slug is already taken" };
    }

    const organization = await auth.api.createOrganization({
      headers: request.headers,
      body: {
        name: validatedData.name,
        slug,
        userId: session.user.id,
      },
    });

    if (!organization) {
      return { error: "Failed to create organization" };
    }

    return redirect("/app");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.flatten().fieldErrors };
    }
    return { error: "Failed to create organization" };
  }
}

export default function OnboardingCreate() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
      <form method="post" className="max-w-sm space-y-4">
        <InputWithLabel
          label="Name"
          id="name"
          name="name"
          error={actionData?.errors?.name?.[0]}
          autoFocus
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        {actionData?.error && <div className="text-red-600 text-sm">{actionData.error}</div>}
      </form>
    </div>
  );
}
