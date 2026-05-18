import { TitleBar, Modal } from "@shopify/app-bridge-react";
import { CheckIcon, OrderDraftIcon } from '@shopify/polaris-icons';

/**
 * DashboardModals — All three dashboard modals (Reply, Delete, Draft).
 *
 * Props:
 *   reply: { show, title, description, text, isSubmitting, onTextChange, onSubmit, onClose }
 *   delete_: { show, title, message, isSubmitting, onConfirm, onClose }
 *   draft: { show, title, message, isSubmitting, onConfirm, onClose }
 *   publish: { show, title, message, isSubmitting, onConfirm, onClose }
 */
export default function DashboardModals({ reply, delete_, draft, publish }) {
    return (
        <>
            {/* Reply Modal */}
            <Modal id="reply-modal" open={reply.show} onHide={reply.onClose}>
                <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 12px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                        {reply.description}
                    </p>
                    <textarea
                        value={reply.text}
                        onChange={(e) => reply.onTextChange(e.target.value)}
                        placeholder="Your Reply"
                        style={{
                            width: "100%", minHeight: "100px", padding: "10px",
                            border: "1px solid #c4cdd5", borderRadius: "8px",
                            fontSize: "14px", resize: "vertical", boxSizing: "border-box",
                            fontFamily: "inherit",
                        }}
                    />
                </div>
                <TitleBar title={reply.title}>
                    <button variant="primary" onClick={reply.onSubmit} disabled={!reply.text.trim() || reply.isSubmitting}>
                        {reply.isSubmitting ? "Sending..." : "Save Reply"}
                    </button>
                    <button onClick={reply.onClose}>Cancel</button>
                </TitleBar>
            </Modal>

            {/* Delete Modal */}
            <Modal id="delete-modal" open={delete_.show} onHide={delete_.onClose}>
                <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 20px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                        {delete_.message}
                    </p>
                </div>
                <TitleBar title={delete_.title}>
                    <button variant="primary" tone="critical" onClick={delete_.onConfirm} disabled={delete_.isSubmitting}>
                        {delete_.isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                    <button onClick={delete_.onClose}>Cancel</button>
                </TitleBar>
            </Modal>

            {/* Draft Modal */}
            <Modal id="draft-modal" open={draft.show} onHide={draft.onClose}>
                <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 20px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                        {draft.message}
                    </p>
                </div>
                <TitleBar title={draft.title}>
                    <button variant="primary" onClick={draft.onConfirm} disabled={draft.isSubmitting}>
                        {draft.isSubmitting ? "Drafting..." : "Draft"}
                    </button>
                    <button onClick={draft.onClose}>Cancel</button>
                </TitleBar>
            </Modal>

            {/* Publish Modal */}
            <Modal id="publish-modal" open={publish?.show} onHide={publish?.onClose}>
                <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 20px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                        {publish?.message}
                    </p>
                </div>
                <TitleBar title={publish?.title || ""}>
                    <button variant="primary" onClick={publish?.onConfirm} disabled={publish?.isSubmitting}>
                        {publish?.isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                    <button onClick={publish?.onClose}>Cancel</button>
                </TitleBar>
            </Modal>
        </>
    );
}
