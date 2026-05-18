import React from "react";
import { render, screen } from "@testing-library/react";

// Mock React Router hooks
jest.mock("react-router", () => ({
    useLoaderData: jest.fn(),
    useActionData: jest.fn(),
    useNavigation: () => ({ state: "idle" }),
    useSearchParams: () => [new URLSearchParams()],
    Form: ({ children }) => <div>{children}</div>,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    redirect: jest.fn(),
}));

// Mock server-side modules to avoid shopify-api TextEncoder issue
jest.mock("../../shopify.server", () => ({
    authenticate: { admin: jest.fn() },
}));

jest.mock("../../billing.server", () => ({
    PLANS: {},
    createSubscription: jest.fn(),
    checkBillingStatus: jest.fn(),
}));

// Import AFTER all mocks are set up
import BillingPage from "../app.billing.jsx";
import { useLoaderData, useActionData } from "react-router";

describe("Billing Page", () => {
    const mockPlans = {
        free: {
            name: "Free",
            price: 0,
            features: ["10 reviews/month"],
        },
        pro: {
            name: "Pro",
            price: 9.99,
            features: ["Unlimited reviews"],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useLoaderData.mockReturnValue({
            plans: mockPlans,
            currentPlan: "Free",
            hasActiveSubscription: true,
            status: "ACTIVE",
            trialEndsAt: null,
        });
        useActionData.mockReturnValue(null);
    });

    test("renders plan names", () => {
        render(<BillingPage />);
        // "Free" appears in both the plan heading and the "currently on the Free plan" banner
        expect(screen.getAllByText(/Free/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Pro")).toBeInTheDocument();
    });

    test("renders price for each plan", () => {
        render(<BillingPage />);
        expect(screen.getByText("$0")).toBeInTheDocument();
        expect(screen.getByText("$9.99")).toBeInTheDocument();
    });
});
