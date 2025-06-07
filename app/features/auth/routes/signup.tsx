import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { SocialLoginButtons } from "~/components/social-login-buttons";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  const validateForm = () => {
    try {
      signupSchema.parse({ name, email, password });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof SignupFormData, string>> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            errors[err.path[0] as keyof SignupFormData] = err.message;
          }
        }
        setFormErrors(errors);
      }
      return false;
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          navigate("/app");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to sign up. Please try again.");
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/90">
              sign in to your account
            </Link>
          </p>
        </div>
        <Form onSubmit={signUp} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <InputWithLabel
              label="Full name"
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
            <InputWithLabel
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
            />
            <InputWithLabel
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign up"}
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
