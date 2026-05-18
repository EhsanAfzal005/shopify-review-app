import React from "react";
import { render, screen, act } from "@testing-library/react";
import ToastNotification from "../ToastNotification";

describe("ToastNotification", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("returns null when message is null", () => {
        const { container } = render(
            <ToastNotification message={null} onDismiss={jest.fn()} />
        );
        expect(container.innerHTML).toBe("");
    });

    test("renders message when provided", () => {
        render(
            <ToastNotification message="Review published!" onDismiss={jest.fn()} />
        );
        expect(screen.getByText("Review published!")).toBeInTheDocument();
    });

    test("calls onDismiss after duration ms", () => {
        const onDismiss = jest.fn();
        render(
            <ToastNotification message="Done!" onDismiss={onDismiss} duration={2000} />
        );

        expect(onDismiss).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
