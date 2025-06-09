import { sanitizeLogData } from "../types";
import { discordAdapter } from "./discord";
import { slackAdapter } from "./slack";
import { teamsAdapter } from "./teams";

// Adapter registry
let adapters = [slackAdapter, teamsAdapter, discordAdapter];

export function registerAdapter(adapter: (log: Record<string, unknown>) => Promise<void>) {
  adapters.push(adapter);
}

export function clearAdapters() {
  adapters = [];
}

export async function notifyAdapters(log: Record<string, unknown>) {
  const safeLog = sanitizeLogData(log);
  const errors: unknown[] = [];
  await Promise.all(
    adapters.map(async (adapter) => {
      try {
        await adapter(safeLog);
      } catch (err) {
        errors.push(err);
      }
    })
  );
  if (errors.length > 0) {
    // Optionally, aggregate or rethrow errors, or log them elsewhere
    // For now, just log to console
    // eslint-disable-next-line no-console
    console.error("Adapter notification errors:", errors);
  }
}
