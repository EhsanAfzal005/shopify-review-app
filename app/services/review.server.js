import prisma from "../db.server";

// ─── Dashboard Queries ──────────────────────────────────────────────

/**
 * Fetch all aggregate stats for the dashboard in a single parallel call.
 * Returns: { totalReviews, approvedReviews, draftedReviews, repliedReviews,
 *            aggregateRating, ratingGroups, topProductGroups, recentReviewsDates }
 */
export async function getDashboardStats(shop) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
        totalReviews,
        approvedReviews,
        draftedReviews,
        repliedReviews,
        aggregateRating,
        ratingGroups,
        topProductGroups,
        recentReviewsDates,
    ] = await Promise.all([
        prisma.review.count({ where: { shop } }),
        prisma.review.count({ where: { shop, approved: true } }),
        prisma.review.count({ where: { shop, approved: false } }),
        prisma.review.count({ where: { shop, NOT: { reply: null } } }),
        prisma.review.aggregate({ where: { shop }, _avg: { rating: true } }),
        prisma.review.groupBy({ by: ['rating'], where: { shop }, _count: { rating: true } }),
        prisma.review.groupBy({
            by: ['productId'],
            where: { shop },
            _count: { productId: true },
            orderBy: { _count: { productId: 'desc' } },
            take: 5,
        }),
        prisma.review.findMany({
            where: { shop, createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        }),
    ]);

    return {
        totalReviews,
        approvedReviews,
        draftedReviews,
        repliedReviews,
        aggregateRating,
        ratingGroups,
        topProductGroups,
        recentReviewsDates,
    };
}

/**
 * Fetch paginated reviews with an optional search filter.
 */
export async function getReviewsPaginated(searchFilter, skip, take) {
    return prisma.review.findMany({
        where: searchFilter,
        orderBy: { createdAt: "desc" },
        take,
        skip,
    });
}

/**
 * Count reviews matching a search filter (for pagination).
 */
export async function getFilteredCount(searchFilter) {
    return prisma.review.count({ where: searchFilter });
}

// ─── Single Review ──────────────────────────────────────────────────

/**
 * Find a single review by ID.
 */
export async function getReviewById(id) {
    return prisma.review.findUnique({ where: { id } });
}
