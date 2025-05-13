import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import PermissionProvider from "./components/providers/permission.provider";
import { auth } from "./lib/auth";
import { ability } from "./lib/permissions.server";
import { packRules, unpackRules } from "@casl/ability/extra";
import { buildMongoQueryMatcher, PureAbility } from "@casl/ability";
import { getEnv } from "./lib/env.server";
import { useNonce } from "./lib/nonce-provider";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const permissions = ability(session?.user);

  const packRulesOutput = packRules(permissions.rules) ?? [];

  return { session, packRulesOutput, ENV: getEnv() };
};

export default function App() {
  const { packRulesOutput, ENV } = useLoaderData<typeof loader>();
  const nonce = useNonce();

  const conditionsMatcher = buildMongoQueryMatcher();
  const unpackedRules = new PureAbility(unpackRules(packRulesOutput), {
    conditionsMatcher,
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PermissionProvider permissions={unpackedRules}>
          <Outlet />
        </PermissionProvider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <div>Wow something went wrong</div>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
