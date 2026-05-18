import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal", () => {
    const defaultProps = {
        open: true,
        title: "Delete Review",
        message: "Are you sure you want to delete this review?",
        onConfirm: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test("returns null when open is false", () => {
        const { container } = render(
            <ConfirmModal {...defaultProps} open={false} />
        );
        expect(container.innerHTML).toBe("");
    });

    test("renders title, message, confirm and cancel buttons when open", () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText("Delete Review")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to delete this review?")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    test("cancel button calls onClose", () => {
        render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("confirm button calls onConfirm", () => {
        render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Confirm"));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    test("backdrop click calls onClose", () => {
        render(<ConfirmModal {...defaultProps} />);
        // The outer backdrop div is the first fixed-position element
        const backdrop = screen.getByText("Delete Review").closest("div").parentElement;
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("inner content click does NOT propagate to backdrop", () => {
        render(<ConfirmModal {...defaultProps} />);
        const inner = screen.getByText("Delete Review").closest("div");
        fireEvent.click(inner);
        // onClose should NOT be called because stopPropagation is called
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    test("default confirmLabel is 'Confirm', custom label works", () => {
        const { rerender } = render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText("Confirm")).toBeInTheDocument();

        rerender(<ConfirmModal {...defaultProps} confirmLabel="Yes, delete" />);
        expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    });

    test("critical tone sets red background, primary sets blue", () => {
        const { rerender } = render(
            <ConfirmModal {...defaultProps} confirmTone="critical" />
        );
        let confirmBtn = screen.getByText("Confirm");
        expect(confirmBtn.style.backgroundColor).toBe("rgb(216, 44, 13)");

        rerender(<ConfirmModal {...defaultProps} confirmTone="primary" />);
        confirmBtn = screen.getByText("Confirm");
        expect(confirmBtn.style.backgroundColor).toBe("rgb(37, 99, 235)");
    });
});
