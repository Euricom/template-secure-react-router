import chalk from "chalk";
import { sanitizeLogData } from "../types";

function getColor(level: string): typeof chalk {
  switch (level) {
    case "debug":
      return chalk.gray;
    case "info":
      return chalk.blue;
    case "notice":
      return chalk.cyan;
    case "warning":
      return chalk.yellow;
    case "critical":
      return chalk.magenta;
    case "emergency":
      return chalk.yellowBright;
    default:
      return chalk.red;
  }
}

function formatMeta(log: Record<string, unknown>) {
  const meta: string[] = [];
  if (log.identity) meta.push(`identity: ${log.identity}`);
  if (!log.identity) meta.push("identity: User");
  if (log.userId) meta.push(`userId: ${log.userId}`);
  if (log.organization) meta.push(`org: ${log.organization}`);
  if (log.role) meta.push(`role: ${log.role}`);
  return meta.join(" | ");
}

const INDENT = "  ";

export async function prettyConsoleErrorAdapter(log: Record<string, unknown>) {
  if (typeof log.level !== "string") return;
  const {
    level: safeLogLevel,
    message: safeLogMessage,
    error: safeLogError,
    stack: safeLogStack,
    userId: safeUserId,
    organization: safeOrganization,
    role: safeRole,
    timestamp: safeTimestamp,
    identity: safeIdentity,
    ...safeLog
  } = sanitizeLogData(log);
  const color = getColor(safeLogLevel as string);
  const levelStr = `[${String(safeLogLevel).toUpperCase() || "LOG"}]`;
  const msg = safeLogMessage || "";
  const meta = formatMeta({
    userId: safeUserId,
    organization: safeOrganization,
    role: safeRole,
    identity: safeIdentity,
  });
  const timestamp = safeTimestamp ? String(safeTimestamp) : new Date().toISOString();

  // Main line: colored level and message
  // biome-ignore lint/suspicious/noConsole: This is the root logger
  console.log(color.bold(levelStr), color(msg));
  // Meta info: dim, indented
  // biome-ignore lint/suspicious/noConsole: This is the root logger
  if (meta) console.log(`${INDENT}${chalk.dim(meta)}`);
  // Timestamp: dim, indented
  // biome-ignore lint/suspicious/noConsole: This is the root logger
  if (timestamp) console.log(`${INDENT}${chalk.dim(timestamp)}`);

  // Error/stack details, indented
  if (safeLogError) {
    // biome-ignore lint/suspicious/noConsole: This is the root logger
    console.error(
      `${INDENT}${chalk.redBright("Error:")}`,
      chalk.redBright(
        typeof safeLogError === "string" ? safeLogError : JSON.stringify(safeLogError, null, 2)
      )
    );
  }
  if (safeLogStack) {
    // biome-ignore lint/suspicious/noConsole: This is the root logger
    console.error(`${INDENT}${chalk.redBright("Stack:")}`);
    // biome-ignore lint/suspicious/noConsole: This is the root logger
    console.error(
      `${INDENT}${chalk.redBright(
        typeof safeLogStack === "string" ? safeLogStack : JSON.stringify(safeLogStack, null, 2)
      )}`
    );
  }

  if (Object.keys(safeLog).length > 0) {
    // biome-ignore lint/suspicious/noConsole: This is the root logger
    console.log(`${INDENT}${chalk.dim("Context:")}`);
    const contextString = typeof safeLog === "string" ? safeLog : JSON.stringify(safeLog, null, 2);
    for (const line of contextString.split("\n")) {
      // biome-ignore lint/suspicious/noConsole: This is the root logger
      console.log(`${INDENT}${chalk.dim(line)}`);
    }
  }
}
