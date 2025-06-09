// Shared types and utilities for logging (FE & BE)

export const LOG_LEVELS = [
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
  "emergency",
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

// Unified identity type for logging context
export type LogIdentity =
  | {
      user?: { id: string };
      organization?: { id?: string; role?: string };
      id?: string;
      identity?: string;
      [key: string]: unknown;
    }
  | "public"
  | "system"
  | null
  | undefined;

// Unified log context type
export type LogContext = Record<string, unknown>;

// Extracts identity info for logging (never includes email or sensitive fields)
export function extractIdentityInfo(identity: LogIdentity): Record<string, unknown> {
  if (!identity || identity === "public" || identity === "system")
    return { identity: identity ?? "public" };
  if (typeof identity === "object") {
    if (identity.user && typeof identity.user === "object" && identity.user.id) {
      return {
        userId: identity.user.id,
        organization: identity.organization?.id,
        role: identity.organization?.role,
      };
    }
    if (identity.id) {
      return { userId: identity.id };
    }
    if (identity.identity) {
      return { identity: identity.identity };
    }
  }
  return { identity: "system" };
}

// Sanitizes log data to remove sensitive fields (e.g., email, token, password)
export function sanitizeLogData<T extends Record<string, unknown>>(data: T): T {
  const SENSITIVE_KEYS = ["email", "token", "password", "session", "accessToken", "refreshToken"];
  const result: Record<string, unknown> = {};
  for (const key in data) {
    if (SENSITIVE_KEYS.includes(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof data[key] === "object" && data[key] !== null) {
      result[key] = sanitizeLogData(data[key] as Record<string, unknown>);
    } else {
      result[key] = data[key];
    }
  }
  return result as T;
}

// Formats identity for display in logs/adapters
export function formatIdentity(log: Record<string, unknown>): string {
  const parts = [];
  if (log.userId) parts.push(`userId: ${log.userId}`);
  if (log.organization) parts.push(`org: ${log.organization}`);
  if (log.role) parts.push(`role: ${log.role}`);
  if (parts.length === 0 && log.identity) parts.push(`identity: ${log.identity}`);
  return parts.join(" | ") || "unknown";
}
