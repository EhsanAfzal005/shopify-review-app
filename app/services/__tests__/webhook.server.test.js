jest.mock("../../db.server", () => ({
    __esModule: true,
    default: {
        session: {
            deleteMany: jest.fn(),
        },
        billingDetail: {
            updateMany: jest.fn(),
            findUnique: jest.fn(),
            deleteMany: jest.fn(),
        },
        review: {
            deleteMany: jest.fn(),
            findMany: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

import db from "../../db.server";
import {
    deleteSessionsByShop,
    cancelBilling,
    getBillingDetails,
    deleteReviewsByProduct,
    getCustomerData,
    redactCustomerData,
    redactShopData,
} from "../webhook.server";

describe("webhook.server", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("deleteSessionsByShop", () => {
        test("calls deleteMany, returns result", async () => {
            db.session.deleteMany.mockResolvedValue({ count: 2 });
            const result = await deleteSessionsByShop("shop.myshopify.com");
            expect(db.session.deleteMany).toHaveBeenCalledWith({
                where: { shop: "shop.myshopify.com" },
            });
            expect(result).toEqual({ count: 2 });
        });

        test("returns null on error", async () => {
            db.session.deleteMany.mockRejectedValue(new Error("DB error"));
            const result = await deleteSessionsByShop("shop.myshopify.com");
            expect(result).toBeNull();
        });
    });

    describe("cancelBilling", () => {
        test("calls updateMany with CANCELLED status", async () => {
            db.billingDetail.updateMany.mockResolvedValue({ count: 1 });
            const result = await cancelBilling("shop.myshopify.com");
            expect(db.billingDetail.updateMany).toHaveBeenCalledWith({
                where: { shop: "shop.myshopify.com" },
                data: expect.objectContaining({ status: "CANCELLED" }),
            });
            expect(result).toEqual({ count: 1 });
        });

        test("returns null on error", async () => {
            db.billingDetail.updateMany.mockRejectedValue(new Error("DB error"));
            const result = await cancelBilling("shop.myshopify.com");
            expect(result).toBeNull();
        });
    });

    describe("getBillingDetails", () => {
        test("calls findUnique", async () => {
            db.billingDetail.findUnique.mockResolvedValue({ email: "a@b.com", ownerName: "Al" });
            const result = await getBillingDetails("shop.myshopify.com");
            expect(db.billingDetail.findUnique).toHaveBeenCalledWith({
                where: { shop: "shop.myshopify.com" },
                select: { email: true, ownerName: true },
            });
            expect(result).toEqual({ email: "a@b.com", ownerName: "Al" });
        });
    });

    describe("deleteReviewsByProduct", () => {
        test("queries both numeric and GID formats", async () => {
            db.review.deleteMany.mockResolvedValue({ count: 3 });
            await deleteReviewsByProduct("12345");
            expect(db.review.deleteMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { productId: "12345" },
                        { productId: "gid://shopify/Product/12345" },
                    ],
                },
            });
        });
    });

    describe("getCustomerData", () => {
        test("returns reviews with metadata", async () => {
            const reviews = [{ id: "r1", productId: "p1" }];
            db.review.findMany.mockResolvedValue(reviews);
            const result = await getCustomerData("shop.myshopify.com", "user@e.com");
            expect(result).toEqual({
                customerEmail: "user@e.com",
                shop: "shop.myshopify.com",
                reviewsCount: 1,
                reviews,
            });
        });
    });

    describe("redactCustomerData", () => {
        test("updates username/email to '[redacted]'", async () => {
            db.review.updateMany.mockResolvedValue({ count: 2 });
            const result = await redactCustomerData("shop.myshopify.com", "user@e.com");
            expect(db.review.updateMany).toHaveBeenCalledWith({
                where: { shop: "shop.myshopify.com", userEmail: "user@e.com" },
                data: { username: "[redacted]", userEmail: "[redacted]" },
            });
            expect(result).toEqual({ count: 2 });
        });
    });

    describe("redactShopData", () => {
        test("deletes reviews, billing, sessions in parallel", async () => {
            db.review.deleteMany.mockResolvedValue({ count: 10 });
            db.billingDetail.deleteMany.mockResolvedValue({ count: 1 });
            db.session.deleteMany.mockResolvedValue({ count: 3 });
            const result = await redactShopData("shop.myshopify.com");
            expect(result).toEqual({
                reviewsDeleted: 10,
                billingDeleted: 1,
                sessionsDeleted: 3,
            });
        });
    });
});
