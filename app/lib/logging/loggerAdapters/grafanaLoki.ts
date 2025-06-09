import { getServerEnv } from "../../env.server";
import { sanitizeLogData } from "../types";

// If LOKI_ENDPOINT or LOKI_LABELS are not in the env type, add them to your env.server.ts type definition.
const env = getServerEnv() as Record<string, string | undefined>;
const LOKI_ENDPOINT = env.LOKI_ENDPOINT || "http://localhost:3100/loki/api/v1/push";
const LOKI_LABELS = env.LOKI_LABELS || '{"job":"app"}';
let warned = false;

export async function grafanaLokiAdapter(log: Record<string, unknown>) {
  if (!LOKI_ENDPOINT) {
    if (!warned) {
      // eslint-disable-next-line no-console
      console.warn("[logger] LOKI_ENDPOINT is not set. Grafana Loki adapter will not send logs.");
      warned = true;
    }
    return;
  }
  const safeLog = sanitizeLogData(log);
  const stream = {
    stream: JSON.parse(LOKI_LABELS),
    values: [[`${Date.now()}000000`, JSON.stringify(safeLog)]],
  };
  await fetch(LOKI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ streams: [stream] }),
  });
}
