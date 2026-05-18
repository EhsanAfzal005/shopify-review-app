import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReplyModal from "../ReplyModal";

describe("ReplyModal", () => {
    const defaultProps = {
        open: true,
        title: "Reply to Review",
        description: "Write your response below.",
        replyText: "",
        onReplyChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        isSubmitting: false,
    };

    beforeEach(() => jest.clearAllMocks());

    test("returns null when open is false", () => {
        const { container } = render(
            <ReplyModal {...defaultProps} open={false} />
        );
        expect(container.innerHTML).toBe("");
    });

    test("renders title, description, textarea, and buttons when open", () => {
        render(<ReplyModal {...defaultProps} />);
        expect(screen.getByText("Reply to Review")).toBeInTheDocument();
        expect(screen.getByText("Write your response below.")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your Reply")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Save Reply")).toBeInTheDocument();
    });

    test("submit button disabled when textarea is empty", () => {
        render(<ReplyModal {...defaultProps} replyText="" />);
        const submitBtn = screen.getByText("Save Reply");
        expect(submitBtn).toBeDisabled();
    });

    test("submit button disabled when textarea is whitespace-only", () => {
        render(<ReplyModal {...defaultProps} replyText="   " />);
        const submitBtn = screen.getByText("Save Reply");
        expect(submitBtn).toBeDisabled();
    });

    test("onReplyChange called on textarea input", () => {
        render(<ReplyModal {...defaultProps} />);
        const textarea = screen.getByPlaceholderText("Your Reply");
        fireEvent.change(textarea, { target: { value: "Thanks!" } });
        expect(defaultProps.onReplyChange).toHaveBeenCalledWith("Thanks!");
    });

    test("submit button calls onSubmit when text is present", () => {
        render(<ReplyModal {...defaultProps} replyText="Great review!" />);
        const submitBtn = screen.getByText("Save Reply");
        expect(submitBtn).not.toBeDisabled();
        fireEvent.click(submitBtn);
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    test("shows 'Sending...' text when isSubmitting is true", () => {
        render(<ReplyModal {...defaultProps} replyText="text" isSubmitting={true} />);
        expect(screen.getByText("Sending...")).toBeInTheDocument();
    });

    test("backdrop click calls onClose", () => {
        render(<ReplyModal {...defaultProps} />);
        const backdrop = screen.getByText("Reply to Review").closest("div").parentElement;
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
});
