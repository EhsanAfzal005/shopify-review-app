import React from "react";
import { render, screen } from "@testing-library/react";
import TopProducts from "../TopProducts";

describe("TopProducts", () => {
    const shop = "test-shop.myshopify.com";

    test("shows 'No data yet.' when products is empty", () => {
        render(<TopProducts products={[]} shop={shop} />);
        expect(screen.getByText("No data yet.")).toBeInTheDocument();
    });

    test("renders product list with titles and review counts", () => {
        const products = [
            { title: "Widget A", count: 15, handle: "widget-a", onlineStoreUrl: null },
            { title: "Widget B", count: 8, handle: "widget-b", onlineStoreUrl: null },
        ];
        render(<TopProducts products={products} shop={shop} />);
        expect(screen.getByText("Widget A")).toBeInTheDocument();
        expect(screen.getByText("15 reviews")).toBeInTheDocument();
        expect(screen.getByText("Widget B")).toBeInTheDocument();
        expect(screen.getByText("8 reviews")).toBeInTheDocument();
    });

    test("first product has highlighted background", () => {
        const products = [
            { title: "Top", count: 20, handle: "top" },
            { title: "Second", count: 5, handle: "second" },
        ];
        const { container } = render(<TopProducts products={products} shop={shop} />);
        // The first product div should have FFEBEE background
        const productDivs = container.querySelectorAll("div[style*='border']");
        expect(productDivs[0].style.backgroundColor).toBe("rgb(255, 235, 238)");
        expect(productDivs[1].style.backgroundColor).toBe("transparent");
    });

    test("builds product URL from handle when no onlineStoreUrl", () => {
        const products = [
            { title: "Widget A", count: 5, handle: "widget-a", onlineStoreUrl: null },
        ];
        render(<TopProducts products={products} shop={shop} />);
        const link = screen.getByText("Widget A").closest("a");
        expect(link).toHaveAttribute(
            "href",
            `https://${shop}/products/widget-a`
        );
    });

    test("uses onlineStoreUrl when available", () => {
        const products = [
            { title: "Widget A", count: 5, handle: "widget-a", onlineStoreUrl: "https://mystore.com/products/widget-a" },
        ];
        render(<TopProducts products={products} shop={shop} />);
        const link = screen.getByText("Widget A").closest("a");
        expect(link).toHaveAttribute("href", "https://mystore.com/products/widget-a");
    });
});
