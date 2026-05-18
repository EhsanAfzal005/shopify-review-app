import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

describe("StatCard", () => {
    test("renders icon, label, and value", () => {
        render(<StatCard icon="📦" label="Total Reviews" value="42" />);
        expect(screen.getByText("📦")).toBeInTheDocument();
        expect(screen.getByText("Total Reviews")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
    });

    test("renders suffix when provided", () => {
        render(<StatCard icon="⭐" label="Rating" value="4.5" suffix="/5" />);
        expect(screen.getByText("4.5")).toBeInTheDocument();
        expect(screen.getByText("/5")).toBeInTheDocument();
    });

    test("renders children instead of icon when children prop given", () => {
        render(
            <StatCard label="Custom" value="10">
                <div data-testid="custom-child">Custom Icon</div>
            </StatCard>
        );
        expect(screen.getByTestId("custom-child")).toBeInTheDocument();
        // The default icon box should not render
        expect(screen.queryByText("📦")).not.toBeInTheDocument();
    });
});
