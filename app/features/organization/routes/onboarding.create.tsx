import { redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/lib/auth";
import { createProtectedAction } from "~/lib/secureRoute/";

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const action = createProtectedAction({
  permissions: {
    action: "create",
    subject: "Organization",
  },
  formValidation: z.object({
    name: z.string().min(1, "Name is required"),
  }),
  function: async ({ request, identity, form }) => {
    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    const { name } = form.data;

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
          userId: identity.user.id,
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
  },
});

export default function OnboardingCreate() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create a new organization</CardTitle>
        <CardDescription>Enter a name for your new organization.</CardDescription>
      </CardHeader>
      <form method="post" autoComplete="off">
        <CardContent className="space-y-4 py-4">
          <InputWithLabel
            label="Name"
            id="name"
            name="name"
            error={actionData?.errors?.name?.[0]}
            autoFocus
          />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          {actionData?.error && (
            <div className="text-center text-destructive text-sm">{actionData.error}</div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
