import React from "react";
import { render, screen } from "@testing-library/react";
import ResponseRateCircle from "../ResponseRateCircle";

describe("ResponseRateCircle", () => {
    test("renders SVG with rate percentage text", () => {
        render(<ResponseRateCircle rate={75} />);
        expect(screen.getByText("75%")).toBeInTheDocument();
    });

    test("renders SVG element with circles", () => {
        const { container } = render(<ResponseRateCircle rate={50} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        const circles = container.querySelectorAll("circle");
        expect(circles.length).toBe(2);
    });

    test("correct stroke calculations for 0% rate", () => {
        const { container } = render(<ResponseRateCircle rate={0} />);
        const circumference = 2 * Math.PI * 24;
        const progressCircle = container.querySelectorAll("circle")[1];
        expect(progressCircle.getAttribute("stroke-dasharray")).toBe(String(circumference));
        // offset = circumference - (0/100) * circumference = circumference
        expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(String(circumference));
    });

    test("correct stroke calculations for 50% rate", () => {
        const { container } = render(<ResponseRateCircle rate={50} />);
        const circumference = 2 * Math.PI * 24;
        const progressCircle = container.querySelectorAll("circle")[1];
        const expectedOffset = circumference - (50 / 100) * circumference;
        expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(String(expectedOffset));
    });

    test("correct stroke calculations for 100% rate", () => {
        const { container } = render(<ResponseRateCircle rate={100} />);
        const circumference = 2 * Math.PI * 24;
        const progressCircle = container.querySelectorAll("circle")[1];
        const expectedOffset = circumference - (100 / 100) * circumference;
        expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(String(expectedOffset));
    });
});
