import {
  Links,
  type LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { PureAbility, buildMongoQueryMatcher } from "@casl/ability";
import { packRules, unpackRules } from "@casl/ability/extra";
import PermissionProvider from "./components/providers/permission.provider";
import { auth } from "./lib/auth";
import { getClientEnv } from "./lib/env.server";
import { useNonce } from "./lib/nonce-provider";
import { ability } from "./lib/permissions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const permissions = ability(session?.user);

  const packRulesOutput = packRules(permissions.rules) ?? [];

  return { session, packRulesOutput, ENV: getClientEnv() };
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
          // biome-ignore lint/security/noDangerouslySetInnerHtml: We need this to allow env variables to be set in the client
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
    <main className="container mx-auto p-4 pt-16">
      <div>Wow something went wrong</div>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
