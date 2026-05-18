import { useLoaderData, useSubmit, useNavigate, useNavigation, useActionData, useRouteError, isRouteErrorResponse } from "react-router";
import { redirect } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { checkBillingStatus } from "../billing.server";

// Services
import {
    getDashboardStats,
    getReviewsPaginated,
    getFilteredCount,
} from "../services/review.server";
import {
    draftReview,
    publishReview,
    deleteReview,
    replyToReview,
    bulkDraftReviews,
    bulkPublishReviews,
    bulkDeleteReviews,
    bulkReplyReviews,
} from "../services/reviewActions.server";
import { getShopDomain } from "../services/shop.server";
import { searchProductsByTitle, buildProductMap, getProductDetails } from "../services/product.server";

// Reusable components
import StatCard from "../components/StatCard";
import RatingDistribution from "../components/RatingDistribution";
import TopProducts from "../components/TopProducts";
import WarningBanner from "../components/WarningBanner";
import ResponseRateCircle from "../components/ResponseRateCircle";
import ReviewsGrowthChart from "../components/ReviewsGrowthChart";
import DashboardModals from "../components/DashboardModals";
import ReviewsSection from "../components/ReviewsSection";

// ─── Loader ──────────────────────────────────────────────────────────

export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = await getShopDomain(admin, session);

    const url = new URL(request.url);

    // BILLING GATE: Check if store has active subscription
    const billingStatus = await checkBillingStatus(shop, admin);
    if (!billingStatus.hasActiveSubscription) {
        url.pathname = "/app/billing";
        url.searchParams.set("reason", "no_subscription");
        return redirect(url.toString());
    }
    const page = Number(url.searchParams.get("page")) || 1;
    const searchQuery = url.searchParams.get("search") || "";
    const take = 20;
    const skip = (page - 1) * take;

    // Build search filter
    let searchFilter = {};
    if (searchQuery.trim()) {
        const orConditions = [
            { username: { contains: searchQuery.trim(), mode: 'insensitive' } },
            { userEmail: { contains: searchQuery.trim(), mode: 'insensitive' } },
            { comment: { contains: searchQuery.trim(), mode: 'insensitive' } },
        ];

        // Search Shopify products by title to get matching product IDs
        const matchingProductIds = await searchProductsByTitle(admin, searchQuery.trim());
        if (matchingProductIds.length > 0) {
            orConditions.push({ productId: { in: matchingProductIds } });
        }

        searchFilter = { shop, OR: orConditions };
    }

    console.time("DashboardLoader");

    // Fetch all stats + paginated reviews in parallel
    const [stats, reviews, filteredCount] = await Promise.all([
        getDashboardStats(shop),
        getReviewsPaginated(searchFilter.OR ? searchFilter : { shop, ...searchFilter }, skip, take),
        getFilteredCount(searchFilter.OR ? searchFilter : { shop, ...searchFilter }),
    ]);

    const {
        totalReviews, draftedReviews, repliedReviews,
        aggregateRating, ratingGroups, topProductGroups, recentReviewsDates,
    } = stats;

    // Derived stats
    const responseRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
    const averageRating = aggregateRating._avg.rating
        ? aggregateRating._avg.rating.toFixed(1)
        : "0.0";

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingGroups.forEach(group => { distribution[group.rating] = group._count.rating; });

    // Reviews Over Time (Last 30 Days)
    const dateCounts = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dateCounts[d.toISOString().split('T')[0]] = 0;
    }
    recentReviewsDates.forEach(r => {
        const dateStr = r.createdAt.toISOString().split('T')[0];
        if (dateCounts[dateStr] !== undefined) dateCounts[dateStr]++;
    });
    const reviewsOverTime = Object.keys(dateCounts).sort().map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dateCounts[date]
    }));

    // Build product map from Shopify GraphQL
    const reviewProductIds = reviews.map(r => r.productId);
    const topProductIds = topProductGroups.map(g => g.productId);
    const allProductIds = [...new Set([...reviewProductIds, ...topProductIds])];
    const productMap = await buildProductMap(admin, allProductIds);

    const serializedReviews = reviews.map((review) => {
        const details = getProductDetails(productMap, review.productId);
        const productUrl = details.onlineStoreUrl || (details.handle ? `https://${shop}/products/${details.handle}` : null);
        return {
            ...review,
            productTitle: details.title,
            productImage: details.image,
            productUrl,
            photos: review.photos || [],
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
        };
    });

    const serializedTopProducts = topProductGroups.map(group => {
        const details = getProductDetails(productMap, group.productId);
        return {
            productId: group.productId,
            count: group._count.productId,
            title: details.title,
            image: details.image,
            handle: details.handle,
            onlineStoreUrl: details.onlineStoreUrl,
        };
    });

    const totalForPagination = searchQuery.trim() ? filteredCount : totalReviews;
    const hasNextPage = (skip + reviews.length) < totalForPagination;
    const hasPreviousPage = page > 1;

    console.timeEnd("DashboardLoader");

    return {
        shop,
        stats: {
            totalReviews: totalReviews.toString(),
            averageRating: averageRating.toString(),
            draftedReviews: draftedReviews.toString(),
        },
        distribution,
        topProducts: serializedTopProducts,
        reviewsOverTime,
        responseRate,
        reviews: serializedReviews,
        search: searchQuery,
        pagination: { page, hasNextPage, hasPreviousPage },
    };
};

// ─── Action ──────────────────────────────────────────────────────────

export const action = async ({ request }) => {
    await authenticate.admin(request);
    const formData = await request.formData();
    const actionType = formData.get("action");
    const reviewId = formData.get("reviewId");

    if (actionType === "draft" && reviewId) {
        await draftReview(reviewId);
        return { success: true, message: "Review drafted successfully" };
    } else if (actionType === "publish" && reviewId) {
        await publishReview(reviewId);
        return { success: true, message: "Review published successfully" };
    } else if (actionType === "delete" && reviewId) {
        await deleteReview(reviewId);
        return { success: true, message: "Review deleted successfully" };
    } else if (actionType === "reply") {
        const replyText = formData.get("replyText");
        await replyToReview(reviewId, replyText);
        return { success: true, message: "Reply sent successfully" };
    } else if (actionType === "bulkDraft") {
        const reviewIds = JSON.parse(formData.get("reviewIds") || "[]");
        if (reviewIds.length > 0) {
            await bulkDraftReviews(reviewIds);
        }
        return { success: true, message: `${reviewIds.length} review(s) drafted` };
    } else if (actionType === "bulkPublish") {
        const reviewIds = JSON.parse(formData.get("reviewIds") || "[]");
        if (reviewIds.length > 0) {
            await bulkPublishReviews(reviewIds);
        }
        return { success: true, message: `${reviewIds.length} review(s) published` };
    } else if (actionType === "bulkDelete") {
        const reviewIds = JSON.parse(formData.get("reviewIds") || "[]");
        if (reviewIds.length > 0) {
            await bulkDeleteReviews(reviewIds);
        }
        return { success: true, message: `${reviewIds.length} review(s) deleted` };
    } else if (actionType === "bulkReply") {
        const reviewIds = JSON.parse(formData.get("reviewIds") || "[]");
        const replyText = formData.get("replyText");
        if (reviewIds.length > 0 && replyText) {
            await bulkReplyReviews(reviewIds, replyText);
        }
        return { success: true, message: `Replied to ${reviewIds.length} review(s)` };
    }

    return null;
};

// ─── Dashboard Component ─────────────────────────────────────────────

export default function Dashboard() {
    const { shop, stats, distribution, topProducts, reviewsOverTime, responseRate, reviews, pagination, search } = useLoaderData();
    const submit = useSubmit();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const actionData = useActionData();
    const [mounted, setMounted] = useState(false);

    // UI state
    const [selectedIds, setSelectedIds] = useState([]);
    const [idsToDelete, setIdsToDelete] = useState([]);
    const [isBulkDelete, setIsBulkDelete] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idsToDraft, setIdsToDraft] = useState([]);
    const [isBulkDraft, setIsBulkDraft] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [idsToPublish, setIdsToPublish] = useState([]);
    const [isBulkPublish, setIsBulkPublish] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isBulkReply, setIsBulkReply] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);

    const isSubmitting = navigation.state !== "idle" && navigation.formMethod != null;
    const isLoading = navigation.state === "loading";

    // Detect if the current navigation is specifically a search or a search-clear
    const isSearching = navigation.state === "loading" && navigation.location
        && (new URLSearchParams(navigation.location.search).has("search") || !!search);

    // Show toast when action completes successfully or from URL param
    useEffect(() => {
        if (actionData?.success && navigation.state === "idle") {
            const message = actionData.message || "Action completed successfully!";
            shopify.toast.show(message);
        }

        // Check for toast in URL (e.g., redirect from delete)
        const params = new URLSearchParams(window.location.search);
        if (params.has("toast")) {
            shopify.toast.show(params.get("toast"));
            // Clean up the URL without triggering a reload
            params.delete("toast");
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
            window.history.replaceState({}, '', newUrl);
        }
    }, [actionData, navigation.state]);

    useEffect(() => { setMounted(true); }, []);

    // Pagination event handlers — preserve search when paging
    useEffect(() => {
        const tableEl = document.getElementById("reviews-table");
        if (!tableEl) return;

        const handleNextPage = () => {
            const params = new URLSearchParams();
            params.set("page", String(pagination.page + 1));
            if (search) params.set("search", search);
            navigate(`?${params.toString()}`);
        };
        const handlePrevPage = () => {
            const params = new URLSearchParams();
            params.set("page", String(pagination.page - 1));
            if (search) params.set("search", search);
            navigate(`?${params.toString()}`);
        };

        tableEl.addEventListener("nextpage", handleNextPage);
        tableEl.addEventListener("previouspage", handlePrevPage);

        return () => {
            tableEl.removeEventListener("nextpage", handleNextPage);
            tableEl.removeEventListener("previouspage", handlePrevPage);
        };
    }, [navigate, pagination.page, search]);

    // ── Handlers ─────────────────────────────────────────────────────

    const handleSearch = useCallback((query) => {
        const params = new URLSearchParams();
        params.set("page", "1");
        if (query) params.set("search", query);
        navigate(`?${params.toString()}`);
    }, [navigate]);

    const handleDraft = (id) => {
        submit({ action: "draft", reviewId: id }, { method: "post" });
    };

    const handlePublish = (id) => {
        submit({ action: "publish", reviewId: id }, { method: "post" });
    };

    const handleDelete = (id) => {
        setIdsToDelete([id]);
        setIsBulkDelete(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (isBulkDelete) {
            submit(
                { action: "bulkDelete", reviewIds: JSON.stringify(selectedIds) },
                { method: "post" },
            );
            setSelectedIds([]);
        } else {
            submit({ action: "delete", reviewId: idsToDelete[0] }, { method: "post" });
        }
        setShowDeleteModal(false);
    };

    const openReplyModal = (review) => {
        setCurrentReview(review);
        setReplyText(review.reply || "");
        setIsBulkReply(false);
        setShowReplyModal(true);
    };

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;

        if (isBulkReply) {
            submit(
                { action: "bulkReply", reviewIds: JSON.stringify(selectedIds), replyText },
                { method: "post" },
            );
        } else {
            submit(
                { action: "reply", reviewId: currentReview.id, replyText },
                { method: "post" },
            );
        }
        setShowReplyModal(false);
    };

    const handleBulkDraft = () => {
        setIdsToDraft(selectedIds);
        setIsBulkDraft(true);
        setShowDraftModal(true);
    };

    const confirmDraft = () => {
        if (isBulkDraft) {
            submit(
                { action: "bulkDraft", reviewIds: JSON.stringify(idsToDraft) },
                { method: "post" },
            );
            setSelectedIds([]);
        }
        setShowDraftModal(false);
    };

    const handleBulkPublish = () => {
        setIdsToPublish(selectedIds);
        setIsBulkPublish(true);
        setShowPublishModal(true);
    };

    const confirmPublish = () => {
        if (isBulkPublish) {
            submit(
                { action: "bulkPublish", reviewIds: JSON.stringify(idsToPublish) },
                { method: "post" },
            );
            setSelectedIds([]);
        }
        setShowPublishModal(false);
    };

    const handleBulkDelete = () => {
        setIdsToDelete(selectedIds);
        setIsBulkDelete(true);
        setShowDeleteModal(true);
    };

    const openBulkReplyModal = () => {
        setCurrentReview(null);
        setReplyText("");
        setIsBulkReply(true);
        setShowReplyModal(true);
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === reviews.length ? [] : reviews.map(r => r.id));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    // ── Derived values for modals ────────────────────────────────────

    const deleteModalTitle = isBulkDelete
        ? `Delete ${idsToDelete.length} Review(s)`
        : "Delete Review";

    const deleteModalMessage = isBulkDelete
        ? `Are you sure you want to delete ${idsToDelete.length} reviews? This action cannot be undone.`
        : "Are you sure you want to delete this review? This action cannot be undone.";

    const replyModalTitle = isBulkReply
        ? `Reply to ${selectedIds.length} review(s)`
        : currentReview ? `Reply to ${currentReview.username}` : "Reply to Review";

    const replyModalDescription = isBulkReply
        ? `This reply will be sent to ${selectedIds.length} selected review(s)`
        : `Review: "${currentReview?.comment}"`;

    const draftModalTitle = isBulkDraft
        ? `Draft ${idsToDraft.length} Review(s)`
        : "Draft Review";

    const draftModalMessage = `Are you sure you want to draft ${isBulkDraft ? idsToDraft.length : 1} review(s)? They will be hidden from the storefront.`;

    // ── Render ───────────────────────────────────────────────────────

    if (isLoading && !isSearching && !search && !isSubmitting) {
        return (
            <s-page heading="Reviews Admin Dashboard" inlineSize="large">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                    <s-spinner size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <s-text tone="subdued">Loading...</s-text>
                    </div>
                </div>
            </s-page>
        );
    }

    return (
        <s-page heading="Reviews Admin Dashboard" inlineSize="large">

            {/* Modals */}
            <DashboardModals
                reply={{
                    show: showReplyModal,
                    title: replyModalTitle,
                    description: replyModalDescription,
                    text: replyText,
                    isSubmitting,
                    onTextChange: setReplyText,
                    onSubmit: handleReplySubmit,
                    onClose: () => setShowReplyModal(false),
                }}
                delete_={{
                    show: showDeleteModal,
                    title: deleteModalTitle,
                    message: deleteModalMessage,
                    isSubmitting,
                    onConfirm: confirmDelete,
                    onClose: () => setShowDeleteModal(false),
                }}
                draft={{
                    show: showDraftModal,
                    title: draftModalTitle,
                    message: draftModalMessage,
                    isSubmitting,
                    onConfirm: confirmDraft,
                    onClose: () => setShowDraftModal(false),
                }}
                publish={{
                    show: showPublishModal,
                    title: isBulkPublish ? `Publish ${idsToPublish.length} Review(s)` : "Publish Review",
                    message: `Are you sure you want to publish ${isBulkPublish ? idsToPublish.length : 1} review(s)? They will be visible on the storefront.`,
                    isSubmitting,
                    onConfirm: confirmPublish,
                    onClose: () => setShowPublishModal(false),
                }}
            />

            <s-stack gap="base">

                {/* 1. Key Metrics Cards */}
                <WarningBanner shop={shop} />

                <s-grid gridTemplateColumns="repeat(4, 1fr)" gap="base">
                    <s-grid-item>
                        <StatCard icon="📝" label="Total Reviews" value={stats.totalReviews} />
                    </s-grid-item>
                    <s-grid-item>
                        <StatCard icon="★" iconColor="#D32F2F" label="Average Rating" value={stats.averageRating} suffix="/5" />
                    </s-grid-item>
                    <s-grid-item>
                        <StatCard icon="📋" label="Drafted Reviews" value={stats.draftedReviews} />
                    </s-grid-item>
                    <s-grid-item>
                        <StatCard label="Response Rate" value="">
                            <ResponseRateCircle rate={responseRate} />
                        </StatCard>
                    </s-grid-item>
                </s-grid>

                {/* 2. Charts Section */}
                <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                    <s-grid-item gridColumn="span 8">
                        <ReviewsGrowthChart data={reviewsOverTime} mounted={mounted} />
                    </s-grid-item>

                    <s-grid-item gridColumn="span 4">
                        <s-stack gap="base">
                            <RatingDistribution distribution={distribution} />
                            <TopProducts products={topProducts} shop={shop} />
                        </s-stack>
                    </s-grid-item>
                </s-grid>

                {/* 3. Reviews Table */}
                <ReviewsSection
                    reviews={reviews}
                    pagination={pagination}
                    search={search}
                    selectedIds={selectedIds}
                    isSubmitting={isSubmitting}
                    isSearching={isSearching}
                    onSearch={handleSearch}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onDraft={handleDraft}
                    onPublish={handlePublish}
                    onDelete={handleDelete}
                    onReply={openReplyModal}
                    onBulkDraft={handleBulkDraft}
                    onBulkPublish={handleBulkPublish}
                    onBulkReply={openBulkReplyModal}
                    onBulkDelete={handleBulkDelete}
                />
            </s-stack>

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
        </s-page>
    );
}

// ─── Error Boundary (Dashboard Friendly Error) ─────────────────────────

export function ErrorBoundary() {
    const error = useRouteError();
    const isResponse = isRouteErrorResponse(error);

    let title = "Something went wrong loading your dashboard";
    let description = "Please try again in a moment. If the problem persists, contact support.";

    if (isResponse) {
        if (error.status === 500) {
            description = "We couldn't reach Shopify or your data service. Check your connection and try again.";
        } else if (error.status === 404) {
            title = "Dashboard not found";
            description = "The requested dashboard page could not be found.";
        }
    } else if (error instanceof Error) {
        const message = error.message?.toLowerCase() || "";
        if (message.includes("graphql_client") || message.includes("fetch failed")) {
            description = "We couldn't reach Shopify right now. This is usually temporary—retry in a few seconds.";
        }
    }

    const handleRetry = () => {
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    return (
        <s-page heading="Reviews Admin Dashboard" inlineSize="large">
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh",
                textAlign: "center",
                gap: "16px",
            }}>
                <s-text type="headingMd" as="h2">
                    {title}
                </s-text>
                <s-text tone="subdued">
                    {description}
                </s-text>
                <s-button onClick={handleRetry} variant="primary">
                    Retry
                </s-button>
            </div>
        </s-page>
    );
}
