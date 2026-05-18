import { useEffect, useMemo, useState } from "react";
import { Form, useActionData, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  const result = await login(request);
  if (result instanceof Response) {
    const location = result.headers.get("Location");
    if (location) {
      const headers = new Headers(result.headers);
      headers.delete("Location");
      return Response.json(
        { redirectUrl: location, host, errors: {}, apiKey: process.env.SHOPIFY_API_KEY || "" },
        { status: 200, headers }
      );
    }
    return result;
  }
  const errors = loginErrorMessage(result);

  return { errors, apiKey: process.env.SHOPIFY_API_KEY || "", host };
};

export const action = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  const result = await login(request);

  // When embedded, Shopify login must happen in the parent window (not in the iframe),
  // otherwise accounts.shopify.com will be blocked by X-Frame-Options / CSP.
  if (result instanceof Response) {
    const location = result.headers.get("Location");
    if (location) {
      const headers = new Headers(result.headers);
      headers.delete("Location");
      return Response.json(
        { redirectUrl: location, host },
        { status: 200, headers },
      );
    }
    return result;
  }

  const errors = loginErrorMessage(result);

  return {
    errors,
    host,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const errors = useMemo(
    () => actionData?.errors ?? loaderData.errors,
    [actionData?.errors, loaderData.errors],
  );

  useEffect(() => {
    const redirectUrl = actionData?.redirectUrl || loaderData?.redirectUrl;
    if (!redirectUrl) return;

    const isInIframe = typeof window !== "undefined" && window.top !== window.self;
    const apiKey = loaderData.apiKey;
    const host = actionData?.host || loaderData.host;

    if (isInIframe && apiKey && host) {
      const app = createApp({ apiKey, host, forceRedirect: true });
      Redirect.create(app).dispatch(Redirect.Action.REMOTE, redirectUrl);
      return;
    }

    window.location.assign(redirectUrl);
  }, [actionData?.redirectUrl, loaderData?.redirectUrl, actionData?.host, loaderData?.apiKey, loaderData?.host]);

  return (
    <s-page>
      <s-section>
        <Form method="post">
          <s-stack gap="base">
            <s-heading>Log in</s-heading>
            <s-text-field
              type="text"
              name="shop"
              label="Shop domain"
              helpText="example.myshopify.com"
              value={shop}
              onInput={(e) => setShop(e.target.value)}
              error={errors.shop || undefined}
            ></s-text-field>
            <s-button type="submit">Log in</s-button>
          </s-stack>
        </Form>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
