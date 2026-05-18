import { getProductDetails, searchProductsByTitle, fetchProductsByIds, buildProductMap } from "../product.server";

describe("product.server", () => {
    describe("getProductDetails", () => {
        const productMap = {
            "gid://shopify/Product/123": {
                title: "Widget",
                image: "https://cdn/img.png",
                handle: "widget",
                onlineStoreUrl: "https://store.com/products/widget",
            },
        };

        test("returns from map when GID exists", () => {
            const result = getProductDetails(productMap, "gid://shopify/Product/123");
            expect(result.title).toBe("Widget");
            expect(result.handle).toBe("widget");
        });

        test("normalizes numeric ID to GID for lookup", () => {
            const result = getProductDetails(productMap, "123");
            expect(result.title).toBe("Widget");
        });

        test("fallback defaults when not found", () => {
            const result = getProductDetails(productMap, "999");
            expect(result).toEqual({
                title: "Unknown Product",
                image: null,
                handle: null,
                onlineStoreUrl: null,
            });
        });
    });

    describe("searchProductsByTitle", () => {
        test("returns empty array on error", async () => {
            const admin = {
                graphql: jest.fn().mockRejectedValue(new Error("Network error")),
            };
            const result = await searchProductsByTitle(admin, "test");
            expect(result).toEqual([]);
        });

        test("returns flat array of GID and numeric IDs", async () => {
            const admin = {
                graphql: jest.fn().mockResolvedValue({
                    json: () => Promise.resolve({
                        data: {
                            products: {
                                nodes: [{ id: "gid://shopify/Product/100" }],
                            },
                        },
                    }),
                }),
            };
            const result = await searchProductsByTitle(admin, "widget");
            expect(result).toEqual(["gid://shopify/Product/100", "100"]);
        });
    });

    describe("fetchProductsByIds", () => {
        test("returns empty for empty input", async () => {
            const admin = { graphql: jest.fn() };
            const result = await fetchProductsByIds(admin, []);
            expect(result).toEqual([]);
            expect(admin.graphql).not.toHaveBeenCalled();
        });

        test("returns empty for null input", async () => {
            const admin = { graphql: jest.fn() };
            const result = await fetchProductsByIds(admin, null);
            expect(result).toEqual([]);
        });
    });

    describe("buildProductMap", () => {
        test("builds map from product nodes", async () => {
            const admin = {
                graphql: jest.fn().mockResolvedValue({
                    json: () => Promise.resolve({
                        data: {
                            nodes: [
                                {
                                    id: "gid://shopify/Product/1",
                                    title: "Foo",
                                    handle: "foo",
                                    onlineStoreUrl: "https://store.com/products/foo",
                                    featuredImage: { url: "https://cdn/foo.png" },
                                },
                            ],
                        },
                    }),
                }),
            };
            const result = await buildProductMap(admin, ["1"]);
            expect(result["gid://shopify/Product/1"]).toEqual({
                title: "Foo",
                image: "https://cdn/foo.png",
                handle: "foo",
                onlineStoreUrl: "https://store.com/products/foo",
            });
        });
    });
});
