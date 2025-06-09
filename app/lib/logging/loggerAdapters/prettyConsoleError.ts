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
  if (log.userId) meta.push(`userId: ${log.userId}`);
  if (log.organization) meta.push(`org: ${log.organization}`);
  if (log.role) meta.push(`role: ${log.role}`);
  return meta.join(" | ");
}

const INDENT = "  ";

export async function prettyConsoleErrorAdapter(log: Record<string, unknown>) {
  if (typeof log.level !== "string") return;
  const safeLog = sanitizeLogData(log);
  const color = getColor(safeLog.level as string);
  const levelStr = `[${String(safeLog.level).toUpperCase() || "LOG"}]`;
  const msg = safeLog.message || "";
  const meta = formatMeta(safeLog);
  const timestamp = safeLog.timestamp ? String(safeLog.timestamp) : new Date().toISOString();

  // Main line: colored level and message
  // eslint-disable-next-line no-console
  console.error(color.bold(levelStr), color(msg));
  // Meta info: dim, indented
  if (meta) console.error(`${INDENT}${chalk.dim(meta)}`);
  // Timestamp: dim, indented
  if (timestamp) console.error(`${INDENT}${chalk.dim(timestamp)}`);

  // Error/stack details, indented
  if (safeLog.error) {
    console.error(
      `${INDENT}${chalk.redBright("Error:")}`,
      chalk.redBright(
        typeof safeLog.error === "string" ? safeLog.error : JSON.stringify(safeLog.error, null, 2)
      )
    );
  }
  if (safeLog.stack) {
    console.error(`${INDENT}${chalk.redBright("Stack:")}`);
    console.error(
      `${INDENT}${chalk.redBright(
        typeof safeLog.stack === "string" ? safeLog.stack : JSON.stringify(safeLog.stack, null, 2)
      )}`
    );
  }
}
