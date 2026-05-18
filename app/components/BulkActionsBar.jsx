import { OrderDraftIcon, ChatIcon, DeleteIcon, CheckIcon } from '@shopify/polaris-icons';

/**
 * BulkActionsBar — Toolbar with Draft / Reply / Delete bulk action buttons.
 *
 * Props:
 *   selectedCount   {number}   Number of selected items
 *   isSubmitting    {boolean}  Disables buttons while a submission is in-flight
 *   onBulkDraft     {function} Called when Draft is clicked
 *   onBulkPublish   {function} Called when Publish is clicked
 *   onBulkReply     {function} Called when Reply is clicked
 *   onBulkDelete    {function} Called when Delete is clicked
 */
export default function BulkActionsBar({
    selectedCount,
    isSubmitting,
    disablePublish,
    disableDraft,
    onBulkDraft,
    onBulkPublish,
    onBulkReply,
    onBulkDelete,
}) {
    if (selectedCount === 0) return null;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
        }}>
            <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#202223",
                whiteSpace: "nowrap",
            }}>{selectedCount} selected</span>
            <s-button
                variant="primary"
                onClick={onBulkPublish}
                disabled={isSubmitting || disablePublish || undefined}
                style={!disablePublish && !isSubmitting ? { background: '#111827', color: '#ffffff', borderColor: '#111827' } : {}}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Publish
                </span>
            </s-button>
            <s-button
                onClick={onBulkDraft}
                disabled={isSubmitting || disableDraft || undefined}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <OrderDraftIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Draft
                </span>
            </s-button>
            <s-button
                onClick={onBulkReply}
                disabled={isSubmitting || undefined}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChatIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Reply
                </span>
            </s-button>
            <s-button
                tone="critical"
                onClick={onBulkDelete}
                disabled={isSubmitting || undefined}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DeleteIcon style={{ width: '16px', height: '16px' }} fill="currentColor" /> Delete
                </span>
            </s-button>
        </div>
    );
}
