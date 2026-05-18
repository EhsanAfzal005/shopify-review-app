import { useEffect } from "react";

/**
 * ToastNotification — Auto-dismissing success toast.
 *
 * Props:
 *   message     {string|null}  Message to display; null = hidden
 *   onDismiss   {function}     Called after auto-dismiss timeout
 *   duration    {number}       Auto-dismiss delay in ms (default 3000)
 */
export default function ToastNotification({ message, onDismiss, duration = 3000 }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => onDismiss(), duration);
            return () => clearTimeout(timer);
        }
    }, [message, onDismiss, duration]);

    if (!message) return null;

    return (
        <div style={{
            position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#1a1a1a", color: "#fff", padding: "12px 24px",
            borderRadius: "8px", fontSize: "14px", fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 10001,
            display: "flex", alignItems: "center", gap: "8px",
            animation: "slideUp 0.3s ease-out",
        }}>
            <span style={{ color: "#34d399" }}>✓</span>
            {message}
        </div>
    );
}
