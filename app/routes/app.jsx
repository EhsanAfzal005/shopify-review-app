import { useEffect, useState } from "react";
import { Link, Outlet, useLoaderData, useRouteError, useNavigation, useLocation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import translations from '@shopify/polaris/locales/en.json';

export default function App() {
  const { apiKey } = useLoaderData();
  const navigation = useNavigation();
  const location = useLocation();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Mark the app as loaded once the first navigation completes
  useEffect(() => {
    if (navigation.state === "idle") {
      setHasLoaded(true);
    }
  }, [navigation.state]);

  useEffect(() => {
    if (window.performance) {
      const navEntry = window.performance.getEntriesByType("navigation")[0];
      if (navEntry) {
        console.log(`App Load Time (Navigation): ${Math.round(navEntry.duration)}ms`);
      } else {
        // Fallback for older browsers or initial load cases
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 0) {
          console.log(`App Load Time (Legacy): ${loadTime}ms`);
        }
      }
    }
  }, []);

  // Show full-page loader on initial load (before any child route has rendered)
  const isInitialLoading = !hasLoaded && navigation.state === "loading";

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={translations}>
        <NavMenu>
          <Link to={`/app${location.search}`} rel="home">Review App</Link>
          <Link to={`/app/billing${location.search}`}>Billing</Link>
        </NavMenu>
        {isInitialLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            gap: '16px',
          }}>
            <s-spinner size="large" />
            <s-text tone="subdued">Loading your dashboard...</s-text>
          </div>
        ) : (
          <Outlet />
        )}
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    // If it's a "Failed to fetch" App Bridge turbo stream error (often from server restarts)
    if (error && error instanceof Error && error.message?.includes("Failed to fetch")) {
      console.warn("Intercepted App Bridge fetch error, reloading window...");
      window.location.reload();
    }
  }, [error]);

  // If it's the specific fetch error, don't render the red screen while we wait for reload
  if (error && error instanceof Error && error.message?.includes("Failed to fetch")) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Reconnecting...</p>
      </div>
    );
  }

  return boundary.error(error);
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
