import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BulkActionsBar from "../BulkActionsBar";

describe("BulkActionsBar", () => {
    const defaultProps = {
        selectedCount: 3,
        isSubmitting: false,
        disablePublish: false,
        disableDraft: false,
        onBulkDraft: jest.fn(),
        onBulkPublish: jest.fn(),
        onBulkReply: jest.fn(),
        onBulkDelete: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test("returns null when selectedCount is 0", () => {
        const { container } = render(
            <BulkActionsBar {...defaultProps} selectedCount={0} />
        );
        expect(container.innerHTML).toBe("");
    });

    test("renders count text and all 4 action buttons", () => {
        render(<BulkActionsBar {...defaultProps} />);
        expect(screen.getByText("3 selected")).toBeInTheDocument();
        expect(screen.getByText(/Publish/)).toBeInTheDocument();
        expect(screen.getByText(/Draft/)).toBeInTheDocument();
        expect(screen.getByText(/Reply/)).toBeInTheDocument();
        expect(screen.getByText(/Delete/)).toBeInTheDocument();
    });

    test("disables buttons when isSubmitting is true", () => {
        render(<BulkActionsBar {...defaultProps} isSubmitting={true} />);
        const buttons = screen.getAllByText(/Publish|Draft|Reply|Delete/)
            .map((el) => el.closest("s-button"));
        buttons.forEach((btn) => {
            expect(btn).toHaveAttribute("disabled");
        });
    });

    test("calls correct callback on each button click", () => {
        render(<BulkActionsBar {...defaultProps} />);

        fireEvent.click(screen.getByText(/Publish/).closest("s-button"));
        expect(defaultProps.onBulkPublish).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText(/Draft/).closest("s-button"));
        expect(defaultProps.onBulkDraft).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText(/Reply/).closest("s-button"));
        expect(defaultProps.onBulkReply).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText(/Delete/).closest("s-button"));
        expect(defaultProps.onBulkDelete).toHaveBeenCalledTimes(1);
    });

    test("disables Publish when disablePublish is true", () => {
        render(<BulkActionsBar {...defaultProps} disablePublish={true} />);
        const publishBtn = screen.getByText(/Publish/).closest("s-button");
        expect(publishBtn).toHaveAttribute("disabled");
    });

    test("disables Draft when disableDraft is true", () => {
        render(<BulkActionsBar {...defaultProps} disableDraft={true} />);
        const draftBtn = screen.getByText(/Draft/).closest("s-button");
        expect(draftBtn).toHaveAttribute("disabled");
    });
});
