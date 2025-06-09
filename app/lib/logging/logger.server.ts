import pino from "pino";
import { getServerEnv } from "../env.server";
import { clearAdapters, notifyAdapters, registerAdapter } from "./loggerAdapters";
import { discordAdapter } from "./loggerAdapters/discord";
import { fileAdapter } from "./loggerAdapters/file";
import { grafanaLokiAdapter } from "./loggerAdapters/grafanaLoki";
import { prettyConsoleErrorAdapter } from "./loggerAdapters/prettyConsoleError";
import { slackAdapter } from "./loggerAdapters/slack";
import { teamsAdapter } from "./loggerAdapters/teams";
import { LOG_LEVELS, extractIdentityInfo, formatIdentity, sanitizeLogData } from "./types";
import type { LogContext, LogIdentity, LogLevel } from "./types";

const LOG_LEVEL = getServerEnv().LOG_LEVEL || "info";

// Adapter registration based on env
const ADAPTERS_MAP = {
  file: fileAdapter,
  slack: slackAdapter,
  teams: teamsAdapter,
  discord: discordAdapter,
  loki: grafanaLokiAdapter,
  prettyConsoleError: prettyConsoleErrorAdapter,
};

function registerEnvAdapters() {
  clearAdapters();
  const env = getServerEnv();
  const enabled = env.LOG_ADAPTERS?.split(",")
    .map((a) => a.trim())
    .filter(Boolean) || ["file", "prettyConsoleError"];
  for (const key of enabled) {
    const adapter = ADAPTERS_MAP[key as keyof typeof ADAPTERS_MAP];
    if (adapter) registerAdapter(adapter);
    else {
      // biome-ignore lint/suspicious/noConsole: The logger is not initialized yet, so we can't use it
      console.warn(`[logger] Unknown adapter '${key}' in LOG_ADAPTERS`);
    }
  }
}
registerEnvAdapters();

// Custom log levels for pino
const customLevels = LOG_LEVELS.reduce(
  (acc, level, idx) => {
    acc[level] = (idx + 1) * 10;
    return acc;
  },
  {} as Record<LogLevel, number>
);

/**
 * Logger interface with async log methods for each level.
 */
export type Logger = {
  [K in LogLevel]: (identity: LogIdentity, msg: string, context?: LogContext) => Promise<void>;
};

const loggerInstance = pino({
  level: LOG_LEVEL,
  customLevels,
  useOnlyCustomLevels: true,
  formatters: {
    bindings(bindings) {
      return { pid: bindings.pid, hostname: bindings.hostname };
    },
    log(object) {
      return object;
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: "pino/file",
        options: { destination: "logs/app.log", mkdir: true },
        level: LOG_LEVEL,
      },
    ],
  },
});

// Helper to log and optionally notify adapters
async function logWithNotify(
  level: LogLevel,
  identity: LogIdentity,
  msg: string,
  context?: LogContext
) {
  const identityInfo = sanitizeLogData(extractIdentityInfo(identity));
  const safeContext = context ? sanitizeLogData(context) : undefined;
  loggerInstance[level](Object.assign({}, identityInfo, safeContext), msg);
  // Always notify all adapters for every log event. Each adapter is responsible for its own filtering logic.
  try {
    await notifyAdapters({
      level,
      ...identityInfo,
      message: msg,
      ...safeContext,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    loggerInstance.error({ notifyError: true, err }, "Failed to notify adapters");
  }
}

// Export the raw pino logger instance if needed
export const rawLogger = loggerInstance;

const logger: Logger = Object.fromEntries(
  LOG_LEVELS.map((level) => [
    level,
    async (identity: LogIdentity, msg: string, context?: LogContext) =>
      logWithNotify(level, identity, msg, context),
  ])
) as Logger;

logger.info("system", "Logger initialized", {
  logLevel: LOG_LEVEL,
  adapters: Object.keys(ADAPTERS_MAP).join(", "),
});

export default logger;
export { formatIdentity };
