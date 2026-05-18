import prisma from "../db.server";

// ─── Admin Panel + CORS API Queries ─────────────────────────────────

/**
 * Get published reviews for a product (used by api.reviews loader / CORS).
 */
export async function getPublishedReviewsByProductId(productId, shop) {
    const where = { productId, approved: true };
    if (shop) where.shop = shop;
    return prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            username: true,
            rating: true,
            comment: true,
            createdAt: true,
            reply: true,
        },
    });
}

/**
 * Create a review (used by api.reviews action / CORS).
 */
export async function createReview({ shop, productId, username, userEmail, rating, comment, orderId }) {
    return prisma.review.create({
        data: {
            shop,
            productId,
            username,
            userEmail,
            rating: parseInt(rating),
            comment,
            orderId: orderId || null,
            approved: true,
        },
    });
}

/**
 * Get all reviews for the admin panel.
 */
export async function getAllReviews(shop) {
    return prisma.review.findMany({
        where: { shop },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Perform an admin action on a review (draft, delete, reply).
 */
export async function adminUpdateReview(id, actionType, data = {}) {
    if (actionType === "delete") {
        await prisma.review.delete({ where: { id } });
        return { success: true, message: "Review deleted" };
    }

    if (actionType === "draft") {
        const review = await prisma.review.update({
            where: { id },
            data: { approved: false },
        });
        return { success: true, review };
    }

    if (actionType === "reply") {
        const review = await prisma.review.update({
            where: { id },
            data: { reply: data.reply },
        });
        return { success: true, review };
    }

    return { error: "Invalid action type" };
}
