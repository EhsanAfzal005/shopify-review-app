import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchBar from "../SearchBar";

describe("SearchBar", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("renders input with placeholder", () => {
        render(<SearchBar onSearch={jest.fn()} placeholder="Search reviews..." />);
        const input = screen.getByPlaceholderText("Search reviews...");
        expect(input).toBeInTheDocument();
    });

    test("fires onSearch after debounce on input", () => {
        const onSearch = jest.fn();
        render(<SearchBar onSearch={onSearch} debounceMs={400} />);
        const input = screen.getByPlaceholderText("Search...");

        // Simulate input event for custom element
        input.value = "hello";
        fireEvent(input, new Event('input', { bubbles: true }));

        // Should not have been called yet
        expect(onSearch).not.toHaveBeenCalled();

        // Fast forward past debounce
        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(onSearch).toHaveBeenCalledWith("hello");
    });
});
