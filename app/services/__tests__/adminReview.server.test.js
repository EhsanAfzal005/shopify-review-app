jest.mock("../../db.server", () => ({
    __esModule: true,
    default: {
        review: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
    },
}));

import prisma from "../../db.server";
import {
    getPublishedReviewsByProductId,
    createReview,
    getAllReviews,
    adminUpdateReview,
} from "../adminReview.server";

describe("adminReview.server", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getPublishedReviewsByProductId", () => {
        test("calls prisma.review.findMany with correct where", async () => {
            prisma.review.findMany.mockResolvedValue([]);
            await getPublishedReviewsByProductId("prod_1", "shop.myshopify.com");
            expect(prisma.review.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { productId: "prod_1", approved: true, shop: "shop.myshopify.com" },
                })
            );
        });
    });

    describe("createReview", () => {
        test("calls prisma.review.create with parsed rating int", async () => {
            prisma.review.create.mockResolvedValue({ id: "new" });
            await createReview({
                shop: "s", productId: "p", username: "u",
                userEmail: "e", rating: "4", comment: "c",
            });
            expect(prisma.review.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ rating: 4 }),
                })
            );
        });
    });

    describe("getAllReviews", () => {
        test("calls prisma.review.findMany with shop filter", async () => {
            prisma.review.findMany.mockResolvedValue([]);
            await getAllReviews("myshop");
            expect(prisma.review.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { shop: "myshop" },
                })
            );
        });
    });

    describe("adminUpdateReview", () => {
        test("delete action calls prisma.review.delete", async () => {
            prisma.review.delete.mockResolvedValue({});
            const result = await adminUpdateReview("id1", "delete");
            expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: "id1" } });
            expect(result).toEqual({ success: true, message: "Review deleted" });
        });

        test("draft action sets approved: false", async () => {
            prisma.review.update.mockResolvedValue({ id: "id1", approved: false });
            const result = await adminUpdateReview("id1", "draft");
            expect(prisma.review.update).toHaveBeenCalledWith({
                where: { id: "id1" },
                data: { approved: false },
            });
            expect(result.success).toBe(true);
        });

        test("reply action sets reply text", async () => {
            prisma.review.update.mockResolvedValue({ id: "id1", reply: "Thanks!" });
            const result = await adminUpdateReview("id1", "reply", { reply: "Thanks!" });
            expect(prisma.review.update).toHaveBeenCalledWith({
                where: { id: "id1" },
                data: { reply: "Thanks!" },
            });
            expect(result.success).toBe(true);
        });

        test("invalid action returns error", async () => {
            const result = await adminUpdateReview("id1", "invalid_action");
            expect(result).toEqual({ error: "Invalid action type" });
        });
    });
});
