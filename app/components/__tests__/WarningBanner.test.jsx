import React from "react";
import { render, screen } from "@testing-library/react";
import WarningBanner from "../WarningBanner";

describe("WarningBanner", () => {
    test("renders warning text and 'Add to Theme' button", () => {
        render(<WarningBanner shop="test-shop.myshopify.com" />);
        expect(screen.getByText(/Action Required/)).toBeInTheDocument();
        expect(screen.getByText("Add to Theme")).toBeInTheDocument();
    });

    test("generates correct deep link from shop domain", () => {
        render(<WarningBanner shop="test-shop.myshopify.com" />);
        const btn = screen.getByText("Add to Theme").closest("s-button");
        const href = btn.getAttribute("href");
        expect(href).toContain("https://admin.shopify.com/store/test-shop/themes/current/editor");
        expect(href).toContain("template=product");
        expect(href).toContain("addAppBlockId=");
    });
});
