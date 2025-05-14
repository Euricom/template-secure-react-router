import { redirect, type ActionFunctionArgs } from "react-router";
import { useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
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

export default function OnboardingJoin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Its currently under construction</CardTitle>
        <CardDescription>
          We are currently working on this feature. Please check back later.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
