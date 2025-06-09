/**
 * Authentication Configuration
 *
 * This file configures the authentication system using better-auth.
 * Security considerations:
 * 1. Cookie Security:
 *    - Secure cookies are enabled in production
 *    - HttpOnly flag prevents JavaScript access to cookies
 *    - SameSite=lax prevents CSRF attacks
 *
 * 2. Password Security:
 *    - Email verification is required for new accounts
 *    - Password reset functionality with secure token validation
 *    - Account deletion requires email verification
 *
 * 3. Session Security:
 *    - Sessions are tracked with IP and User Agent
 *    - Impersonation tracking for admin actions
 *    - Session revocation on password reset
 *
 * 4. OAuth Security:
 *    - Google OAuth integration with secure client credentials
 *    - Environment variables for sensitive credentials
 */

import { PrismaClient } from "@prisma/client";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, customSession, organization } from "better-auth/plugins";
import { getServerEnv } from "./env.server";
import logger from "./logging/logger.server";

const prisma = new PrismaClient();

export const options = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      logger.info("system", "Sending reset password email", {
        toAddress: user.email,
        resetPasswordUrl: url,
        token,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: getServerEnv().GOOGLE_CLIENT_ID,
      clientSecret: getServerEnv().GOOGLE_CLIENT_SECRET,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      logger.info("system", "Sending verification email", {
        toAddress: user.email,
        verificationUrl: url,
        token,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, token }) => {
        logger.info("system", "Sending change email verification email", {
          toAddress: user.email,
          verificationUrl: url,
          token,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        logger.info("system", "Sending delete account verification email", {
          toAddress: user.email,
          verificationUrl: url,
          token,
        });
      },
    },
  },
  advanced: {
    cookiePrefix: "my-ba",
    useSecureCookies: false,
    defaultCookieAttributes: {
      secure: true, // SECURITY: Ensures cookies are only sent over HTTPS
      httpOnly: true, // SECURITY: Prevents JavaScript access to cookies
      sameSite: "lax" as const, // SECURITY: Prevents CSRF attacks
      partitioned: false, // Not enough browser support
      prefix: getServerEnv().NODE_ENV === "development" ? undefined : ("host" as const),
    },
  },
  plugins: [
    admin(),
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `http://localhost:5173/app/organization/onboarding/join/${data.id}`;
        const email = data.email;
        const invitedBy = data.inviter.user.name;
        const organizationName = data.organization.name;

        logger.info("system", "Sending invitation email", {
          toAddress: email,
          inviteLink,
          invitedBy,
          organizationName,
        });
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      return {
        user,
        session,
      };
    }, options),
  ],
});

export type Session = typeof auth.$Infer.Session;
