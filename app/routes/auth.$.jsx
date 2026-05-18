import { redirect, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
    return null;
  } catch (error) {
    // If Shopify tries to redirect straight to accounts.shopify.com from inside the iframe,
    // browsers will block it with "accounts.shopify.com refused to connect".
    // Instead, push the merchant through our /auth/login route, which performs a
    // top-level redirect using App Bridge (see auth.login/route.jsx).
    if (error instanceof Response && error.status === 302) {
      const location = error.headers.get("Location") || "";

      if (location.startsWith("https://accounts.shopify.com")) {
        const currentUrl = new URL(request.url);
        const host = currentUrl.searchParams.get("host") || "";
        const shop = currentUrl.searchParams.get("shop") || "";

        const loginUrl = new URL("/auth/login", currentUrl.origin);
        if (host) loginUrl.searchParams.set("host", host);
        if (shop) loginUrl.searchParams.set("shop", shop);

        throw redirect(loginUrl.toString());
      }
    }

    throw error;
  }
};

// Shopify needs React Router to catch some thrown responses, so that their headers are included.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

