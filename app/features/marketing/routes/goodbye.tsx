import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function GoodbyePage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Goodbye!</CardTitle>
          <CardDescription className="text-center">
            Your account has been successfully deleted
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            We're sorry to see you go. If you change your mind, you can always create a new account.
          </p>
          <Button asChild>
            <Link to="/signup">Create New Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
