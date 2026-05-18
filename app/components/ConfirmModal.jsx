/**
 * ConfirmModal — Generic confirmation dialog overlay.
 *
 * Props:
 *   open       {boolean}  Whether the modal is visible
 *   title      {string}   Modal heading
 *   message    {string}   Descriptive text / warning
 *   confirmLabel {string} Label for the confirm button (default "Confirm")
 *   confirmTone  {string} "critical" | "primary" — sets button colour
 *   onConfirm  {function} Called when the user clicks confirm
 *   onClose    {function} Called when the user closes the modal
 */
export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    confirmTone = "critical",
    onConfirm,
    onClose,
}) {
    if (!open) return null;

    const confirmBg = confirmTone === "critical" ? "#d82c0d" : "#2563eb";

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
                    maxWidth: "420px", width: "90%",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 600 }}>
                    {title}
                </h2>
                <p style={{ margin: "0 0 20px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                    {message}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
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
                        onClick={onConfirm}
                        style={{
                            padding: "8px 16px", border: "none",
                            borderRadius: "8px", backgroundColor: confirmBg,
                            color: "#fff", cursor: "pointer",
                            fontSize: "14px", fontWeight: 500,
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
