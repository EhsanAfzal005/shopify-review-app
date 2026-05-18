import React from "react";
import { render, screen } from "@testing-library/react";
import RatingDistribution from "../RatingDistribution";

describe("RatingDistribution", () => {
    const distribution = { 1: 2, 2: 3, 3: 5, 4: 10, 5: 20 };

    test("renders 5 rating rows (5 → 1)", () => {
        render(<RatingDistribution distribution={distribution} />);
        // Each row shows the count in an s-text element
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("shows correct star count text per row", () => {
        render(<RatingDistribution distribution={distribution} />);
        // There should be 5 rows, each with 5 star characters
        const stars = screen.getAllByText("★");
        // 5 rows × 5 stars per row = 25 star spans
        expect(stars.length).toBe(25);
    });

    test("calculates percentage widths correctly", () => {
        const simple = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 10 };
        const { container } = render(<RatingDistribution distribution={simple} />);
        // Total is 10; for rating 5 → 10/10 = 100%
        const bars = container.querySelectorAll("div[style*='width']");
        // Find the filled bar for rating 5 (first row rendered)
        const filledBars = Array.from(bars).filter(
            (b) => b.style.width && b.style.width.includes("%")
        );
        expect(filledBars[0].style.width).toBe("100%");
    });
});
