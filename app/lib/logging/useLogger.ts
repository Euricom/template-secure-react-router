import { useMemo } from "react";
import { LOG_LEVELS, extractIdentityInfo, sanitizeLogData } from "./types";
import type { LogContext, LogIdentity, LogLevel } from "./types";

/**
 * Maps log level to the appropriate console method.
 */
function getConsoleMethod(
  level: LogLevel
): keyof Pick<Console, "debug" | "info" | "warn" | "error"> {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
    case "notice":
      return "info";
    case "warning":
      return "warn";
    default:
      return "error";
  }
}

/**
 * React hook providing a logger object for all log levels.
 *
 * @param options Optional configuration (e.g., custom handler, pretty print)
 */
export function useLogger(options?: {
  handler?: (level: LogLevel, identity: LogIdentity, message: string, context?: LogContext) => void;
  pretty?: boolean;
}) {
  // Only use window.env for environment detection (FE context)
  const isProd = typeof window !== "undefined" && window.env?.NODE_ENV === "production";
  const pretty = options?.pretty ?? !isProd;
  const handler = options?.handler;

  return useMemo(() => {
    const logger = {} as Record<
      LogLevel,
      (identity: LogIdentity, message: string, context?: LogContext) => void
    >;
    for (const level of LOG_LEVELS) {
      logger[level] = (identity, message, context) => {
        if (isProd && !handler) return;
        const safeContext = context ? sanitizeLogData(context) : undefined;
        const safeIdentity = sanitizeLogData(extractIdentityInfo(identity));
        if (handler) {
          handler(level, identity, message, safeContext);
        } else {
          const method = getConsoleMethod(level);
          const consoleMethod = console[method] as (
            message?: unknown,
            ...optionalParams: unknown[]
          ) => void;
          if (pretty && typeof window !== "undefined" && window.env?.NODE_ENV !== "production") {
            consoleMethod(
              `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`,
              safeIdentity,
              safeContext || ""
            );
          } else {
            consoleMethod(
              JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                ...safeIdentity,
                message,
                ...safeContext,
              })
            );
          }
        }
      };
    }
    return logger;
  }, [isProd, handler, pretty]);
}
