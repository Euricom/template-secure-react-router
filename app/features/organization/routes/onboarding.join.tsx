import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function OnboardingJoin() {
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
