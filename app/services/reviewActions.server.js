import prisma from "../db.server";

// ─── Single & Bulk Review Actions ────────────────────────────────────

/**
 * Draft a single review (hide from storefront).
 */
export async function draftReview(id) {
    return prisma.review.update({
        where: { id },
        data: { approved: false },
    });
}

/**
 * Publish a single review (make visible on storefront).
 */
export async function publishReview(id) {
    return prisma.review.update({
        where: { id },
        data: { approved: true },
    });
}

/**
 * Delete a single review.
 */
export async function deleteReview(id) {
    return prisma.review.delete({ where: { id } });
}

/**
 * Reply to a single review.
 */
export async function replyToReview(id, replyText) {
    return prisma.review.update({
        where: { id },
        data: { reply: replyText, replyAt: new Date() },
    });
}

/**
 * Draft multiple reviews by IDs (hide from storefront).
 */
export async function bulkDraftReviews(ids) {
    return prisma.review.updateMany({
        where: { id: { in: ids } },
        data: { approved: false },
    });
}

/**
 * Publish multiple reviews by IDs (make visible on storefront).
 */
export async function bulkPublishReviews(ids) {
    return prisma.review.updateMany({
        where: { id: { in: ids } },
        data: { approved: true },
    });
}

/**
 * Delete multiple reviews by IDs.
 */
export async function bulkDeleteReviews(ids) {
    return prisma.review.deleteMany({ where: { id: { in: ids } } });
}

/**
 * Reply to multiple reviews with the same text.
 */
export async function bulkReplyReviews(ids, replyText) {
    return prisma.review.updateMany({
        where: { id: { in: ids } },
        data: { reply: replyText, replyAt: new Date() },
    });
}
