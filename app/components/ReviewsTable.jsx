import { Link } from "react-router";
import { CheckIcon, ChatIcon, DeleteIcon, EditIcon, OrderDraftIcon } from '@shopify/polaris-icons';

/**
 * ReviewsTable — Paginated reviews table with selection.
 *
 * Props:
 *   reviews           {array}     Review objects
 *   pagination        {object}    { page, hasNextPage, hasPreviousPage }
 *   selectedIds       {array}     Currently selected review IDs
 *   searchQuery       {string}    Current search query (for "no results" message)
 *   isSubmitting      {boolean}   Whether an action is currently in progress
 *   onToggleSelect    {function}  (id: string) => void
 *   onToggleSelectAll {function}  () => void
 *   onDraft           {function}  (id: string) => void
 *   onPublish         {function}  (id: string) => void
 *   onDelete          {function}  (id: string) => void
 *   onReply           {function}  (review: object) => void
 */
export default function ReviewsTable({
    reviews,
    pagination,
    selectedIds,
    searchQuery = "",
    isSubmitting = false,
    onToggleSelect,
    onToggleSelectAll,
    onDraft,
    onPublish,
    onDelete,
    onReply,
}) {
    // Empty state — no reviews at all
    if (reviews.length === 0 && pagination.page === 1 && !searchQuery) {
        return (
            <s-box padding="base">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
                    <img
                        src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        alt="No reviews"
                        style={{ maxWidth: "200px", marginBottom: '16px' }}
                    />
                    <s-heading level="2">No reviews yet</s-heading>
                    <div style={{ marginTop: '8px' }}>
                        <s-text tone="subdued">Once customers submit reviews, they will appear here.</s-text>
                    </div>
                </div>
            </s-box>
        );
    }

    // Empty state — search returned no results
    if (reviews.length === 0 && searchQuery) {
        return (
            <s-box padding="base">
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', padding: "40px 0" }}>
                    <s-text tone="subdued">
                        No reviews match "{searchQuery}"
                    </s-text>
                </div>
            </s-box>
        );
    }

    return (
        <s-stack gap="none">
            <s-table
                id="reviews-table"
                paginate
                hasPreviousPage={pagination.hasPreviousPage || undefined}
                hasNextPage={pagination.hasNextPage || undefined}
            >
                <s-table-header-row>
                    <s-table-header>
                        <input
                            type="checkbox"
                            checked={selectedIds.length === reviews.length && reviews.length > 0}
                            onChange={onToggleSelectAll}
                            style={{ cursor: "pointer" }}
                            disabled={isSubmitting}
                        />
                    </s-table-header>
                    <s-table-header listSlot="primary">Product Name</s-table-header>
                    <s-table-header>Rating & Review</s-table-header>
                    <s-table-header>Customer Info</s-table-header>
                    <s-table-header>Date & Status</s-table-header>
                    <s-table-header>Actions</s-table-header>
                </s-table-header-row>

                <s-table-body>
                    {reviews.map((review) => (
                        <s-table-row key={review.id}>
                            <s-table-cell>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(review.id)}
                                    onChange={() => onToggleSelect(review.id)}
                                    style={{ cursor: "pointer" }}
                                    disabled={isSubmitting}
                                />
                            </s-table-cell>
                            <s-table-cell>
                                <div style={{ maxWidth: "200px" }}>
                                    {review.productUrl ? (
                                        <a href={review.productUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                                            <s-text type="strong">{review.productTitle}</s-text>
                                        </a>
                                    ) : (
                                        <s-text type="strong">{review.productTitle}</s-text>
                                    )}
                                </div>
                            </s-table-cell>
                            <s-table-cell>
                                <div style={{ maxWidth: "300px" }}>
                                    <s-stack gap="tight">
                                        <s-stack direction="inline" gap="tight" blockAlign="center">
                                            <s-text type="strong">{(review.rating || 0)} ★</s-text>
                                            {review.photos && review.photos.length > 0 && (
                                                <s-badge tone="info">📷 {review.photos.length}</s-badge>
                                            )}
                                        </s-stack>
                                        <Link to={`/app/review/${review.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <s-stack gap="tight">
                                                <s-text>{review.comment}</s-text>
                                                <s-text tone="critical" style={{ textDecoration: "underline" }}>
                                                    View & Reply →
                                                </s-text>
                                            </s-stack>
                                        </Link>
                                    </s-stack>
                                </div>
                            </s-table-cell>
                            <s-table-cell>
                                <div style={{ maxWidth: "180px" }}>
                                    <s-stack gap="none">
                                        <s-text type="strong">{review.username}</s-text>
                                        <s-text tone="subdued">{review.userEmail}</s-text>
                                    </s-stack>
                                </div>
                            </s-table-cell>
                            <s-table-cell>
                                <s-stack gap="tight">
                                    <s-text>{new Date(review.createdAt).toLocaleDateString()}</s-text>
                                    {review.approved ? (
                                        <s-badge tone="success">Published</s-badge>
                                    ) : (
                                        <s-badge tone="warning">Drafted</s-badge>
                                    )}
                                </s-stack>
                            </s-table-cell>
                            <s-table-cell>
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                                    {review.approved ? (
                                        <s-button
                                            onClick={() => onDraft(review.id)}
                                            disabled={isSubmitting || selectedIds.length > 0 || undefined}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <OrderDraftIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Draft
                                            </span>
                                        </s-button>
                                    ) : (
                                        <s-button
                                            variant="primary"
                                            onClick={() => onPublish(review.id)}
                                            disabled={isSubmitting || selectedIds.length > 0 || undefined}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Publish
                                            </span>
                                        </s-button>
                                    )}
                                    <s-button
                                        onClick={() => onReply(review)}
                                        disabled={isSubmitting || selectedIds.length > 0 || undefined}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {review.reply ? <><EditIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Edit</> : <><ChatIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Reply</>}
                                        </span>
                                    </s-button>
                                    <s-button
                                        tone="critical"
                                        onClick={() => onDelete(review.id)}
                                        disabled={isSubmitting || selectedIds.length > 0 || undefined}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <DeleteIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Delete
                                        </span>
                                    </s-button>
                                </div>
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        </s-stack>
    );
}
