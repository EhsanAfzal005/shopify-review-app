import { getShopDomain } from "../shop.server";

describe("shop.server", () => {
    test("returns session.shop when available", async () => {
        const admin = { graphql: jest.fn() };
        const session = { shop: "test-shop.myshopify.com" };
        const result = await getShopDomain(admin, session);
        expect(result).toBe("test-shop.myshopify.com");
        expect(admin.graphql).not.toHaveBeenCalled();
    });

    test("falls back to GraphQL query when session has no shop", async () => {
        const admin = {
            graphql: jest.fn().mockResolvedValue({
                json: () => Promise.resolve({
                    data: { shop: { url: "https://test-shop.myshopify.com" } },
                }),
            }),
        };
        const session = {};
        const result = await getShopDomain(admin, session);
        expect(admin.graphql).toHaveBeenCalled();
        expect(result).toBe("test-shop.myshopify.com");
    });

    test("throws on GraphQL failure", async () => {
        const admin = {
            graphql: jest.fn().mockRejectedValue(new Error("GraphQL error")),
        };
        const session = {};
        await expect(getShopDomain(admin, session)).rejects.toThrow(
            "Failed to resolve shop domain"
        );
    });
});
