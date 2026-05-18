jest.mock("../../db.server", () => ({
    __esModule: true,
    default: {
        review: {
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

import prisma from "../../db.server";
import { createPublicReview, voteReview } from "../publicReview.server";

describe("publicReview.server", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("createPublicReview", () => {
        test("validates type, defaults to 'PRODUCT'", async () => {
            prisma.review.create.mockResolvedValue({ id: "new" });
            await createPublicReview({
                shop: "s", productId: "p", rating: "5",
                comment: "Great", customerName: "John", email: "j@e.com",
                photos: [], type: "INVALID_TYPE",
            });
            expect(prisma.review.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ type: "PRODUCT" }),
                })
            );
        });

        test("accepts valid types like STORE", async () => {
            prisma.review.create.mockResolvedValue({ id: "new" });
            await createPublicReview({
                shop: "s", productId: "p", rating: "4",
                comment: "Nice", customerName: "Jane", email: "j@e.com",
                photos: [], type: "STORE",
            });
            expect(prisma.review.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ type: "STORE" }),
                })
            );
        });

        test("filters photos: max 5, data:image/* prefix, max size", async () => {
            const validPhoto = "data:image/png;base64,abc123";
            const invalidPhoto = "not-a-data-uri";
            const photos = [
                validPhoto,
                invalidPhoto,
                validPhoto,
                validPhoto,
                validPhoto,
                validPhoto,        // 6th — should be sliced off
                validPhoto,        // 7th — should be sliced off
            ];

            prisma.review.create.mockResolvedValue({ id: "new" });
            await createPublicReview({
                shop: "s", productId: "p", rating: "5",
                comment: "c", customerName: "u", email: "e",
                photos, type: "PRODUCT",
            });

            const call = prisma.review.create.mock.calls[0][0];
            // Max 5 photos from slice, then filtered to only data:image/* ones
            // From the first 5: [valid, invalid, valid, valid, valid] → 4 valid
            expect(call.data.photos.length).toBe(4);
            expect(call.data.photos.every((p) => p.startsWith("data:image/"))).toBe(true);
        });

        test("defaults username to 'Anonymous' when customerName is empty", async () => {
            prisma.review.create.mockResolvedValue({ id: "new" });
            await createPublicReview({
                shop: "s", productId: "p", rating: "5",
                comment: "c", customerName: "", email: "e",
                photos: [], type: "PRODUCT",
            });
            expect(prisma.review.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ username: "Anonymous" }),
                })
            );
        });
    });

    describe("voteReview", () => {
        test("increments helpful count", async () => {
            prisma.review.update.mockResolvedValue({});
            await voteReview("r1", "helpful");
            expect(prisma.review.update).toHaveBeenCalledWith({
                where: { id: "r1" },
                data: { helpfulCount: { increment: 1 } },
            });
        });

        test("increments unhelpful count", async () => {
            prisma.review.update.mockResolvedValue({});
            await voteReview("r1", "unhelpful");
            expect(prisma.review.update).toHaveBeenCalledWith({
                where: { id: "r1" },
                data: { unhelpfulCount: { increment: 1 } },
            });
        });
    });
});
