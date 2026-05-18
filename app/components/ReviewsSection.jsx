import { SearchIcon } from '@shopify/polaris-icons';
import SearchBar from "./SearchBar";
import BulkActionsBar from "./BulkActionsBar";
import ReviewsTable from "./ReviewsTable";

/**
 * ReviewsSection — Complete reviews management block with search, bulk actions, and table.
 *
 * Props:
 *   reviews         {Array}     List of review objects
 *   pagination      {Object}    { page, hasNextPage, hasPreviousPage }
 *   search          {string}    Current search query
 *   selectedIds     {Array}     Currently selected review IDs
 *   isSubmitting    {boolean}   Whether a form submission is in-flight
 *   isSearching     {boolean}   Whether a search navigation is in-flight
 *   onSearch        {function}  (query: string) => void
 *   onToggleSelect  {function}  (id: string) => void
 *   onToggleSelectAll {function} () => void
 *   onDraft         {function}  (id: string) => void
 *   onPublish       {function}  (id: string) => void
 *   onDelete        {function}  (id: string) => void
 *   onReply         {function}  (review: object) => void
 *   onBulkDraft     {function}  () => void
 *   onBulkPublish   {function}  () => void
 *   onBulkReply     {function}  () => void
 *   onBulkDelete    {function}  () => void
 */
export default function ReviewsSection({
    reviews,
    pagination,
    search,
    selectedIds,
    isSubmitting,
    isSearching,
    onSearch,
    onToggleSelect,
    onToggleSelectAll,
    onDraft,
    onPublish,
    onDelete,
    onReply,
    onBulkDraft,
    onBulkPublish,
    onBulkReply,
    onBulkDelete,
}) {
    const selectedObjList = reviews.filter(r => selectedIds.includes(r.id));
    const hasPublished = selectedObjList.some(r => r.approved === true);
    const hasDrafted = selectedObjList.some(r => r.approved === false);

    return (
        <s-section padding="none">
            {/* Search + Bulk Actions Row */}
            <div style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "12px 16px",
                gap: "16px",
                borderBottom: "1px solid #e1e3e5",
            }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px", color: "#202223" }}>Search</p>
                        <SearchBar
                            initialValue={search}
                            placeholder="Search by name, email, product, or comment..."
                            onSearch={onSearch}
                        />
                    </div>
                    <s-button
                        variant="primary"
                        onClick={() => onSearch(search)}
                        disabled={isSearching || undefined}
                        style={{ marginBottom: "0", height: "36px", minWidth: "36px" }}
                    >
                        {isSearching ? (
                            <s-spinner size="small" />
                        ) : (
                            <SearchIcon style={{ width: '20px', height: '20px' }} fill="currentColor" />
                        )}
                    </s-button>
                </div>
                <BulkActionsBar
                    selectedCount={selectedIds.length}
                    isSubmitting={isSubmitting}
                    disablePublish={hasPublished}
                    disableDraft={hasDrafted}
                    onBulkDraft={onBulkDraft}
                    onBulkPublish={onBulkPublish}
                    onBulkReply={onBulkReply}
                    onBulkDelete={onBulkDelete}
                />
            </div>
            <ReviewsTable
                reviews={reviews}
                pagination={pagination}
                selectedIds={selectedIds}
                searchQuery={search}
                isSubmitting={isSubmitting}
                onToggleSelect={onToggleSelect}
                onToggleSelectAll={onToggleSelectAll}
                onDraft={onDraft}
                onPublish={onPublish}
                onDelete={onDelete}
                onReply={onReply}
            />
        </s-section>
    );
}
