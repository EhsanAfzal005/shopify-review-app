import React from "react";
import { render, screen } from "@testing-library/react";

// Mock recharts
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div>Line</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>Grid</div>,
    Tooltip: () => <div>Tooltip</div>,
}));

import ReviewsGrowthChart from "../ReviewsGrowthChart";

describe("ReviewsGrowthChart", () => {
    const data = [
        { date: "Mar 01", count: 5 },
        { date: "Mar 02", count: 8 },
    ];

    test("shows 'Loading chart...' when mounted is false", () => {
        render(<ReviewsGrowthChart data={data} mounted={false} />);
        expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    test("renders chart container when mounted is true", () => {
        render(<ReviewsGrowthChart data={data} mounted={true} />);
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
        expect(screen.getByTestId("line-chart")).toBeInTheDocument();
        expect(screen.queryByText("Loading chart...")).not.toBeInTheDocument();
    });
});
