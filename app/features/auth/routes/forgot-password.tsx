import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Form, Link } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            errors[err.path[0] as keyof ForgotPasswordFormData] = err.message;
          }
        }
        setFormErrors(errors);
      }
      return false;
    }
  };

  const requestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    await authClient.forgetPassword(
      {
        email,
        redirectTo: "http://localhost:5173/forgot-password/validate",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setSuccess(true);
          setLoading(false);
        },
        onError: (ctx: { error: { message: string } }) => {
          setError(ctx.error.message || "Failed to request password reset. Please try again.");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center font-extrabold text-3xl text-foreground">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <Form onSubmit={requestPasswordReset} className="mt-8 space-y-6">
          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              Password reset instructions have been sent to your email address.
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
              error={formErrors.email}
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request password reset"}
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary hover:text-primary/90">
              Back to sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
