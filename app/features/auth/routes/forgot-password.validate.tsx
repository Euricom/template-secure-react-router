import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Form, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { InputWithLabel } from "~/components/input-with-label";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            errors[err.path[0] as keyof ResetPasswordFormData] = err.message;
          }
        }
        setFormErrors(errors);
      }
      return false;
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token) {
      setError("Invalid or expired reset token");
      return;
    }

    if (!validateForm()) return;

    await authClient.resetPassword(
      {
        token,
        newPassword: password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setSuccess(true);
          setLoading(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to reset password. Please try again.");
          setLoading(false);
        },
      }
    );

    await authClient.revokeOtherSessions();
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center font-extrabold text-3xl text-foreground">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-muted-foreground text-sm">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <div className="text-center">
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center font-extrabold text-3xl text-foreground">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Please enter your new password below.
          </p>
        </div>
        <Form onSubmit={resetPassword} className="mt-8 space-y-6">
          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              Password has been reset successfully. Redirecting to login...
            </div>
          )}
          <div className="space-y-4">
            <InputWithLabel
              label="New password"
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
            />
            <InputWithLabel
              label="Confirm new password"
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={formErrors.confirmPassword}
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
