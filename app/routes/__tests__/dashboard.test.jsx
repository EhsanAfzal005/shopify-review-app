import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock React Router hooks
jest.mock("react-router", () => ({
    useLoaderData: jest.fn(),
    useSubmit: jest.fn(),
    useNavigate: jest.fn(),
    useNavigation: jest.fn(() => ({ state: "idle" })),
    useActionData: jest.fn(() => null),
    useRouteError: jest.fn(),
    isRouteErrorResponse: jest.fn(() => false),
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    redirect: jest.fn(),
}));

// Mock Shopify App Bridge (include Modal + TitleBar used by DashboardModals)
jest.mock("@shopify/app-bridge-react", () => ({
    useAppBridge: () => ({}),
    TitleBar: ({ children }) => <div>{children}</div>,
    Modal: ({ children, open }) => (open ? <div>{children}</div> : null),
}));

// Mock Polaris Icons (used by ReviewsTable, BulkActionsBar, ReviewsSection)
jest.mock("@shopify/polaris-icons", () =>
    new Proxy({}, {
        get: (_, name) => () => <span data-testid={`icon-${name}`} />,
    })
);

// Mock Recharts
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    Line: () => <div>Line</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>Grid</div>,
    Tooltip: () => <div>Tooltip</div>,
}));

// Mock server-side modules to avoid shopify-api TextEncoder issue
jest.mock("../../shopify.server", () => ({
    authenticate: { admin: jest.fn() },
}));

jest.mock("../../billing.server", () => ({
    checkBillingStatus: jest.fn(),
}));

jest.mock("../../services/review.server", () => ({
    getDashboardStats: jest.fn(),
    getReviewsPaginated: jest.fn(),
    getFilteredCount: jest.fn(),
}));

jest.mock("../../services/reviewActions.server", () => ({
    draftReview: jest.fn(),
    publishReview: jest.fn(),
    deleteReview: jest.fn(),
    replyToReview: jest.fn(),
    bulkDraftReviews: jest.fn(),
    bulkPublishReviews: jest.fn(),
    bulkDeleteReviews: jest.fn(),
    bulkReplyReviews: jest.fn(),
}));

jest.mock("../../services/product.server", () => ({
    searchProductsByTitle: jest.fn(),
    buildProductMap: jest.fn(),
    getProductDetails: jest.fn(),
}));

jest.mock("../../services/shop.server", () => ({
    getShopDomain: jest.fn(),
}));

// Import Dashboard AFTER all mocks are set up
import Dashboard from "../app._index.jsx";
import { useLoaderData, useSubmit, useNavigate, useNavigation, useActionData } from "react-router";

describe("Dashboard Component", () => {
    const mockData = {
        shop: "test-shop.myshopify.com",
        stats: {
            totalReviews: "10",
            averageRating: "4.5",
            draftedReviews: "2",
        },
        distribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
        topProducts: [],
        reviewsOverTime: [],
        responseRate: 50,
        reviews: [
            {
                id: "1",
                productId: "prod_1",
                productTitle: "Test Product",
                username: "John Doe",
                userEmail: "john@example.com",
                rating: 5,
                comment: "Great!",
                approved: true,
                reply: null,
                photos: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ],
        search: "",
        pagination: {
            page: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Dashboard uses shopify.toast.show in useEffect
        global.shopify = { toast: { show: jest.fn() } };
        useLoaderData.mockReturnValue(mockData);
        useSubmit.mockReturnValue(jest.fn());
        useNavigate.mockReturnValue(jest.fn());
        useNavigation.mockReturnValue({ state: "idle" });
        useActionData.mockReturnValue(null);
    });

    test("renders main metrics correctly", () => {
        render(<Dashboard />);
        expect(screen.getByText("Total Reviews")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("Average Rating")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    test("renders reviews table", () => {
        render(<Dashboard />);
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Great!")).toBeInTheDocument();
    });
});
