import prisma from "../db.server";

// ─── Public / Storefront API ────────────────────────────────────────

/**
 * Get published reviews for a product with pagination, filtering, searching, and advanced sorting.
 * Used by api.public.reviews loader.
 */
export async function getPublishedReviews(productId, page = 1, limit = 3, type = "PRODUCT", sort = "Newest", search = "") {

    // Normalize productId: query for both numeric and GID formats, unless it is "STORE"
    let productIdFilter = {};
    if (productId && productId !== "STORE") {
        const numericId = productId.replace("gid://shopify/Product/", "");
        const gidId = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`;
        productIdFilter = { in: [numericId, gidId] };
    }

    // Base Where clause
    let whereClause = {
        approved: true
    };

    if (productId && productId !== "STORE") {
        whereClause.productId = productIdFilter;
    }

    if (type && type !== "ALL") {
        whereClause.type = type;
    }

    // Apply search filter if provided
    if (search && search.trim() !== "") {
        whereClause = {
            ...whereClause,
            OR: [
                { comment: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } }
            ]
        };
    }

    // Determine orderBy based on sort string
    let orderByClause = { createdAt: "desc" };
    if (sort === "Highest rating") {
        orderByClause = { rating: "desc" };
    }

    const skip = (page - 1) * limit;

    // Run all independent queries concurrently to improve response time
    const [
        totalReviewsCount,
        reviews,
        globalAggregations,
        ratingGroups,
        typeGroups
    ] = await Promise.all([
        // 1. Get filtered count for pagination
        prisma.review.count({ where: whereClause }),
        // 2. Get the actual paginated reviews (or all reviews if we need custom JS sorting)
        sort === "Pictures first" 
            ? prisma.review.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" }, // fallback global sort before JS sort
                select: {
                    id: true, rating: true, comment: true, username: true,
                    photos: true, createdAt: true, reply: true, replyAt: true,
                    type: true, helpfulCount: true, unhelpfulCount: true,
                },
            }).then(allReviews => {
                // Perform global sort in JS for "Pictures first"
                allReviews.sort((a, b) => {
                    const aHasPhoto = a.photos && a.photos.length > 0 ? 1 : 0;
                    const bHasPhoto = b.photos && b.photos.length > 0 ? 1 : 0;
                    return bHasPhoto - aHasPhoto; // items with photos come first
                });
                // Then apply pagination (slice)
                return allReviews.slice(skip, skip + limit);
            })
            : prisma.review.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip,
                take: limit,
                select: {
                    id: true, rating: true, comment: true, username: true,
                    photos: true, createdAt: true, reply: true, replyAt: true,
                    type: true, helpfulCount: true, unhelpfulCount: true,
                },
            }),
        // 3. Get true global aggregations disregarding search and type for the headers
        prisma.review.aggregate({
            where: productId === "STORE" ? { approved: true } : { productId: productIdFilter, approved: true },
            _avg: { rating: true },
            _count: { rating: true },
        }),
        // 4. Get rating distribution
        prisma.review.groupBy({
            by: ['rating'],
            where: productId === "STORE" ? { approved: true } : { productId: productIdFilter, approved: true },
            _count: { rating: true },
        }),
        // 5. Get specifics counts for the tabs
        prisma.review.groupBy({
            by: ['type'],
            where: productId === "STORE" ? { approved: true } : { productId: productIdFilter, approved: true },
            _count: { type: true },
        })
    ]);

    const totalPages = Math.ceil(totalReviewsCount / limit);

    const tabCounts = {
        PRODUCT: 0,
        STORE: 0,
        QUESTION: 0
    };
    typeGroups.forEach(g => {
        tabCounts[g.type] = g._count.type;
    });

    const totalReviews = globalAggregations._count.rating;
    const averageRating = globalAggregations._avg.rating
        ? globalAggregations._avg.rating.toFixed(1)
        : "0.0";

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingGroups.forEach(g => {
        distribution[g.rating] = g._count.rating;
    });

    const mappedReviews = reviews.map(r => ({
        ...r,
        customerName: r.username,
    }));

    return {
        reviews: mappedReviews,
        stats: {
            totalReviews,
            averageRating: parseFloat(averageRating),
            distribution,
            tabCounts
        },
        pagination: {
            currentPage: page,
            totalPages,
            limit,
            totalReviews: totalReviewsCount, // Filtered count
        },
    };
}

/**
 * Create a review submitted from the storefront (public).
 */
export async function createPublicReview({ shop, productId, rating, comment, customerName, email, photos, type }) {
    let photoArray = [];
    if (photos && Array.isArray(photos)) {
        photoArray = photos.slice(0, 5).filter(p =>
            typeof p === 'string' &&
            p.startsWith('data:image/') &&
            p.length < 2.8 * 1024 * 1024
        );
    }

    // Validate type
    const validTypes = ["PRODUCT", "STORE", "QUESTION"];
    const reviewType = validTypes.includes(type) ? type : "PRODUCT";

    return prisma.review.create({
        data: {
            shop,
            productId,
            rating: parseInt(rating),
            comment,
            username: customerName || "Anonymous",
            userEmail: email,
            photos: photoArray,
            approved: true,
            type: reviewType
        },
    });
}

/**
 * Increment helpful or unhelpful count for a specific review
 */
export async function voteReview(reviewId, actionType = "helpful") {
    const updateField = actionType === "helpful"
        ? { helpfulCount: { increment: 1 } }
        : { unhelpfulCount: { increment: 1 } };

    return prisma.review.update({
        where: { id: reviewId },
        data: updateField
    });
}
