import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { useLogger } from "~/lib/logging/useLogger";

type SocialProvider = Parameters<typeof authClient.signIn.social>[0]["provider"];

export function SocialLoginButtons() {
  const navigate = useNavigate();
  const logger = useLogger();
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoading(provider);
    try {
      await authClient.signIn.social(
        { provider, callbackURL: "/app/profile" },
        {
          onSuccess: () => {
            navigate("/app/profile");
          },
          onError: (ctx) => {
            logger.error("public", "Social login error:", ctx.error);
            setLoading(null);
          },
        }
      );
    } catch (error) {
      logger.error("public", "Social login error:", { error });
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("google")}
        disabled={loading === "google"}
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span className="ml-2">Continue with Google</span>
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("microsoft")}
        disabled={loading === "microsoft"}
      >
        {loading === "microsoft" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
            <path fill="#f3f3f3" d="M0 0h23v23H0z" />
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        <span className="ml-2">Continue with Microsoft</span>
      </Button>
    </div>
  );
}
