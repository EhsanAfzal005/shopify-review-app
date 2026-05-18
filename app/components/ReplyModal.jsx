/**
 * ReplyModal — Modal overlay for composing / editing a reply.
 *
 * Props:
 *   open          {boolean}
 *   title         {string}   Heading text
 *   description   {string}   Sub-text shown below the heading
 *   replyText     {string}   Current value of the textarea
 *   onReplyChange {function} (value: string) => void
 *   onSubmit      {function} Called on Save / Send
 *   onClose       {function} Called on Cancel / backdrop click
 *   isSubmitting  {boolean}  Disables button + shows spinner
 */
export default function ReplyModal({
    open,
    title,
    description,
    replyText,
    onReplyChange,
    onSubmit,
    onClose,
    isSubmitting = false,
}) {
    if (!open) return null;

    const disabled = !replyText.trim() || isSubmitting;

    return (
        <div
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 10000,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#fff", borderRadius: "12px", padding: "24px",
                    maxWidth: "500px", width: "90%",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}>
                    {title}
                </h2>
                <p style={{ margin: "0 0 12px 0", color: "#616161", fontSize: "14px" }}>
                    {description}
                </p>
                <textarea
                    value={replyText}
                    onChange={(e) => onReplyChange(e.target.value)}
                    placeholder="Your Reply"
                    style={{
                        width: "100%", minHeight: "100px", padding: "10px",
                        border: "1px solid #c4cdd5", borderRadius: "8px",
                        fontSize: "14px", resize: "vertical", boxSizing: "border-box",
                        fontFamily: "inherit",
                    }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 16px", border: "1px solid #c4cdd5",
                            borderRadius: "8px", backgroundColor: "#fff",
                            cursor: "pointer", fontSize: "14px", fontWeight: 500,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={disabled}
                        style={{
                            padding: "8px 16px", border: "none",
                            borderRadius: "8px",
                            backgroundColor: disabled ? "#94a3b8" : "#2563eb",
                            color: "#fff",
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontSize: "14px", fontWeight: 500,
                            display: "flex", alignItems: "center", gap: "6px",
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span style={{
                                    width: "14px", height: "14px",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "#fff", borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "spin 0.6s linear infinite",
                                }} />
                                Sending...
                            </>
                        ) : "Save Reply"}
                    </button>
                </div>
            </div>
        </div>
    );
}
