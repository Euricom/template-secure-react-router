import { getServerEnv } from "../../env.server";
import { formatIdentity, sanitizeLogData } from "../types";

const TEAMS_WEBHOOK_URL = getServerEnv().TEAMS_WEBHOOK_URL;
const LEVELS = ["error", "critical", "emergency"];
let warned = false;

export async function teamsAdapter(log: Record<string, unknown>) {
  if (!TEAMS_WEBHOOK_URL) {
    if (!warned) {
      // eslint-disable-next-line no-console
      console.warn("[logger] TEAMS_WEBHOOK_URL is not set. Teams adapter will not send logs.");
      warned = true;
    }
    return;
  }
  if (typeof log.level !== "string" || !LEVELS.includes(log.level)) return;

  const safeLog = sanitizeLogData(log);
  const identityStr = formatIdentity(safeLog);
  const text = `**[${String(safeLog.level).toUpperCase()}]** [${identityStr}] ${safeLog.message}\n${safeLog.timestamp}\n${JSON.stringify(safeLog, null, 2)}`;

  await fetch(TEAMS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
