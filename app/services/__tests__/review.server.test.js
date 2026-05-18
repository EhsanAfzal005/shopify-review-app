jest.mock("../../db.server", () => ({
    __esModule: true,
    default: {
        review: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

import prisma from "../../db.server";
import { getReviewsPaginated, getFilteredCount, getReviewById } from "../review.server";

describe("review.server", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getReviewsPaginated", () => {
        test("passes filter, skip, take to prisma", async () => {
            prisma.review.findMany.mockResolvedValue([]);
            const filter = { shop: "myshop" };
            await getReviewsPaginated(filter, 10, 5);
            expect(prisma.review.findMany).toHaveBeenCalledWith({
                where: filter,
                orderBy: { createdAt: "desc" },
                take: 5,
                skip: 10,
            });
        });
    });

    describe("getFilteredCount", () => {
        test("passes filter to prisma.count", async () => {
            prisma.review.count.mockResolvedValue(42);
            const filter = { shop: "myshop", approved: true };
            const result = await getFilteredCount(filter);
            expect(prisma.review.count).toHaveBeenCalledWith({ where: filter });
            expect(result).toBe(42);
        });
    });

    describe("getReviewById", () => {
        test("calls findUnique with id", async () => {
            prisma.review.findUnique.mockResolvedValue({ id: "r1", comment: "Nice" });
            const result = await getReviewById("r1");
            expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { id: "r1" } });
            expect(result.id).toBe("r1");
        });
    });
});
