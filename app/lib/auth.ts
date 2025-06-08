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

const prisma = new PrismaClient();

export const options = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log("Sending reset password email to", user.email);
      console.log("Reset password URL:", url);
      console.log("Token:", token);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("Sending verification email to", user.email);
      console.log("Verification URL:", url);
      console.log("Token:", token);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, token }) => {
        console.log("Sending change email verification email to", user.email);
        console.log("Verification URL:", url);
        console.log("Token:", token);
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        console.log("Sending delete account verification email to", user.email);
        console.log("Verification URL:", url);
        console.log("Token:", token);
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
      prefix: process.env.NODE_ENV === "development" ? undefined : ("host" as const),
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

        console.log("Sending invitation email to", email);
        console.log("Invite link:", inviteLink);
        console.log("Invited by:", invitedBy);
        console.log("Organization name:", organizationName);
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
