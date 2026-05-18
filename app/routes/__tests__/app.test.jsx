import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../app.jsx";

// Mock server-side dependencies
jest.mock("../../shopify.server", () => ({
    authenticate: {
        admin: jest.fn(),
    },
}));

jest.mock("@shopify/shopify-app-react-router/server", () => ({
    boundary: {
        error: jest.fn(),
        headers: jest.fn(),
    },
}));

// Mock React Router hooks
jest.mock("react-router", () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    Outlet: () => <div>Outlet Content</div>,
    useLoaderData: () => ({
        apiKey: "test-api-key",
    }),
    useRouteError: jest.fn(),
    useNavigation: jest.fn(() => ({ state: "idle" })),
    useLocation: jest.fn(() => ({ pathname: "/", search: "", hash: "", state: null })),
}));

// Mock Shopify App Bridge
jest.mock("@shopify/app-bridge-react", () => ({
    NavMenu: ({ children }) => <nav>{children}</nav>,
}));

// Mock Shopify App React Router
jest.mock("@shopify/shopify-app-react-router/react", () => ({
    AppProvider: ({ children }) => <div>{children}</div>,
}));

test("renders App with Outlet", () => {
    render(<App />);

    // Check if Outlet is rendered
    expect(screen.getByText("Outlet Content")).toBeInTheDocument();
});
