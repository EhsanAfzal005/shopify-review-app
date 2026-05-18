import React from "react";
import { render, screen } from "@testing-library/react";

// Mock App Bridge components
jest.mock("@shopify/app-bridge-react", () => ({
    Modal: ({ children }) => <div data-testid="modal">{children}</div>,
    TitleBar: ({ children }) => <div data-testid="titlebar">{children}</div>,
}));

// Mock React Router hooks
jest.mock("react-router", () => ({
    useLoaderData: jest.fn(),
    useActionData: jest.fn(),
    useSubmit: jest.fn(),
    useNavigate: jest.fn(),
    useNavigation: jest.fn(),
    Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

// Mock server-side modules to avoid shopify-api TextEncoder issue
jest.mock("../../shopify.server", () => ({
    authenticate: { admin: jest.fn() },
}));

jest.mock("../../services/review.server", () => ({
    getReviewById: jest.fn(),
    draftReview: jest.fn(),
    publishReview: jest.fn(),
    deleteReview: jest.fn(),
    replyToReview: jest.fn(),
}));

jest.mock("../../services/product.server", () => ({
    fetchSingleProduct: jest.fn(),
}));

import ReviewDetail from "../app.review.$id.jsx";

describe("Review Detail Page", () => {
    const mockReview = {
        id: "1",
        username: "Jane Smith",
        userEmail: "jane@example.com",
        comment: "Excellent service!",
        rating: 5,
        approved: false,
        reply: null,
        photos: ["photo-url"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockProduct = {
        title: "Test Product",
        image: "https://example.com/image.png",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.shopify = { toast: { show: jest.fn() } };
        require("react-router").useLoaderData.mockReturnValue({
            review: mockReview,
            product: mockProduct,
        });
        require("react-router").useActionData.mockReturnValue(undefined);
        require("react-router").useSubmit.mockReturnValue(jest.fn());
        require("react-router").useNavigate.mockReturnValue(jest.fn());
        require("react-router").useNavigation.mockReturnValue({ state: "idle" });
    });

    test("renders review content", () => {
        render(<ReviewDetail />);
        expect(screen.getByText("Excellent service!")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
});
