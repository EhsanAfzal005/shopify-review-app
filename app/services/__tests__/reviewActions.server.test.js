jest.mock("../../db.server", () => ({
    __esModule: true,
    default: {
        review: {
            update: jest.fn(),
            delete: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

import prisma from "../../db.server";
import {
    draftReview,
    publishReview,
    deleteReview,
    replyToReview,
    bulkDraftReviews,
    bulkPublishReviews,
    bulkDeleteReviews,
    bulkReplyReviews,
} from "../reviewActions.server";

describe("reviewActions.server", () => {
    beforeEach(() => jest.clearAllMocks());

    test("draftReview sets approved: false", async () => {
        prisma.review.update.mockResolvedValue({});
        await draftReview("id1");
        expect(prisma.review.update).toHaveBeenCalledWith({
            where: { id: "id1" },
            data: { approved: false },
        });
    });

    test("publishReview sets approved: true", async () => {
        prisma.review.update.mockResolvedValue({});
        await publishReview("id1");
        expect(prisma.review.update).toHaveBeenCalledWith({
            where: { id: "id1" },
            data: { approved: true },
        });
    });

    test("deleteReview calls prisma.review.delete", async () => {
        prisma.review.delete.mockResolvedValue({});
        await deleteReview("id1");
        expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: "id1" } });
    });

    test("replyToReview sets reply and replyAt", async () => {
        prisma.review.update.mockResolvedValue({});
        await replyToReview("id1", "Thanks!");
        expect(prisma.review.update).toHaveBeenCalledWith({
            where: { id: "id1" },
            data: { reply: "Thanks!", replyAt: expect.any(Date) },
        });
    });

    test("bulkDraftReviews uses in filter with IDs", async () => {
        prisma.review.updateMany.mockResolvedValue({ count: 2 });
        await bulkDraftReviews(["a", "b"]);
        expect(prisma.review.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["a", "b"] } },
            data: { approved: false },
        });
    });

    test("bulkPublishReviews uses in filter with IDs", async () => {
        prisma.review.updateMany.mockResolvedValue({ count: 2 });
        await bulkPublishReviews(["a", "b"]);
        expect(prisma.review.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["a", "b"] } },
            data: { approved: true },
        });
    });

    test("bulkDeleteReviews uses in filter with IDs", async () => {
        prisma.review.deleteMany.mockResolvedValue({ count: 2 });
        await bulkDeleteReviews(["a", "b"]);
        expect(prisma.review.deleteMany).toHaveBeenCalledWith({
            where: { id: { in: ["a", "b"] } },
        });
    });

    test("bulkReplyReviews uses in filter with IDs", async () => {
        prisma.review.updateMany.mockResolvedValue({ count: 2 });
        await bulkReplyReviews(["a", "b"], "Thanks all!");
        expect(prisma.review.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["a", "b"] } },
            data: { reply: "Thanks all!", replyAt: expect.any(Date) },
        });
    });
});
