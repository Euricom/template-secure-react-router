import pino from "pino";
import { sanitizeLogData } from "../types";

// Use pino.destination for efficient file writing
const destination = pino.destination({ dest: "logs/app.log", mkdir: true });
const fileLogger = pino({}, destination);

export async function fileAdapter(log: Record<string, unknown>) {
  const safeLog = sanitizeLogData(log);
  fileLogger.info({ ...safeLog, level: safeLog.level || "info" });
}
