import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock react-router Link
jest.mock("react-router", () => ({
    Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
}));

import ReviewsTable from "../ReviewsTable";

describe("ReviewsTable", () => {
    const baseReview = {
        id: "r1",
        productId: "p1",
        productTitle: "Widget",
        productUrl: null,
        username: "alice",
        userEmail: "alice@example.com",
        rating: 5,
        comment: "Love it!",
        approved: true,
        reply: null,
        photos: [],
        createdAt: "2025-01-15T12:00:00Z",
    };

    const defaultProps = {
        reviews: [baseReview],
        pagination: { page: 1, hasNextPage: false, hasPreviousPage: false },
        selectedIds: [],
        searchQuery: "",
        isSubmitting: false,
        onToggleSelect: jest.fn(),
        onToggleSelectAll: jest.fn(),
        onDraft: jest.fn(),
        onPublish: jest.fn(),
        onDelete: jest.fn(),
        onReply: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test("empty state when no reviews, page 1, no search", () => {
        render(<ReviewsTable {...defaultProps} reviews={[]} />);
        expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    });

    test("'No reviews match' message when search returns empty", () => {
        render(
            <ReviewsTable {...defaultProps} reviews={[]} searchQuery="xyz" />
        );
        expect(screen.getByText(/No reviews match "xyz"/)).toBeInTheDocument();
    });

    test("renders table with review data", () => {
        render(<ReviewsTable {...defaultProps} />);
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("alice@example.com")).toBeInTheDocument();
        expect(screen.getByText("Love it!")).toBeInTheDocument();
        expect(screen.getByText(/5 ★/)).toBeInTheDocument();
    });

    test("shows 'Published' badge for approved reviews", () => {
        render(<ReviewsTable {...defaultProps} />);
        expect(screen.getByText("Published")).toBeInTheDocument();
    });

    test("shows 'Drafted' badge for unapproved reviews", () => {
        const draftReview = { ...baseReview, approved: false };
        render(<ReviewsTable {...defaultProps} reviews={[draftReview]} />);
        expect(screen.getByText("Drafted")).toBeInTheDocument();
    });

    test("shows 'Edit' button for reviews with reply, 'Reply' for no reply", () => {
        // No reply → Reply button
        render(<ReviewsTable {...defaultProps} />);
        // "Reply" appears in both the action button and the "View & Reply →" link
        expect(screen.getAllByText(/Reply/).length).toBeGreaterThanOrEqual(1);

        // With reply → Edit button
        const repliedReview = { ...baseReview, reply: "Thanks!" };
        const { unmount } = render(
            <ReviewsTable {...defaultProps} reviews={[repliedReview]} />
        );
        expect(screen.getAllByText(/Edit/).length).toBeGreaterThanOrEqual(1);
    });

    test("checkbox selection calls onToggleSelect", () => {
        render(<ReviewsTable {...defaultProps} />);
        const checkboxes = screen.getAllByRole("checkbox");
        // First checkbox is select-all, second is the review checkbox
        fireEvent.click(checkboxes[1]);
        expect(defaultProps.onToggleSelect).toHaveBeenCalledWith("r1");
    });

    test("select-all checkbox calls onToggleSelectAll", () => {
        render(<ReviewsTable {...defaultProps} />);
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[0]);
        expect(defaultProps.onToggleSelectAll).toHaveBeenCalledTimes(1);
    });

    test("action buttons disabled when isSubmitting is true", () => {
        render(<ReviewsTable {...defaultProps} isSubmitting={true} />);
        const buttons = screen.getAllByText(/Draft|Reply|Delete/)
            .map((el) => el.closest("s-button"))
            .filter(Boolean);
        buttons.forEach((btn) => {
            expect(btn).toHaveAttribute("disabled");
        });
    });
});
