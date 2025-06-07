import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Form } from "react-router";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { SocialLoginButtons } from "~/components/social-login-buttons";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("user@user.com");
  const [password, setPassword] = useState("hoihoihoi");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message;
          }
        }
        setFormErrors(errors);
      }
      return false;
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          navigate("/app");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to sign in. Please try again.");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
              create a new account
            </Link>
          </p>
        </div>
        <Form onSubmit={signIn} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <InputWithLabel
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors?.email}
            />
            <InputWithLabel
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors?.password}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember-me" className="text-sm text-foreground">
                Remember me
              </Label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <SocialLoginButtons />
        </Form>
      </div>
    </div>
  );
}
