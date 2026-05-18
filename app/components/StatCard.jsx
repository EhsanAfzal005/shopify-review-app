/**
 * StatCard — Single metric display with icon.
 *
 * Props:
 *   icon     {string}  Emoji or icon character
 *   iconBg   {string}  Background colour for the icon circle (default #FFEBEE)
 *   iconColor{string}  Icon text colour (optional)
 *   label    {string}  Metric label
 *   value    {string}  Metric value
 *   suffix   {string}  Optional suffix shown after value (e.g. "/5")
 *   children {node}    Optional — replaces the icon box with custom content
 */
export default function StatCard({ icon, iconBg = "#FFEBEE", iconColor, label, value, suffix, children }) {
    return (
        <s-section>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {children || (
                    <div style={{
                        width: "48px", height: "48px",
                        backgroundColor: iconBg, borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ fontSize: "24px", color: iconColor }}>{icon}</span>
                    </div>
                )}
                <s-stack gap="tight">
                    <s-text tone="subdued">{label}</s-text>
                    {suffix ? (
                        <s-stack direction="inline" gap="tight" blockAlign="baseline">
                            <span style={{ fontSize: "1.8em", fontWeight: "700", lineHeight: "1" }}>{value}</span>
                            <span style={{ color: "#6d7175", fontSize: "0.9em" }}>{suffix}</span>
                        </s-stack>
                    ) : (
                        <span style={{ fontSize: "1.8em", fontWeight: "700", lineHeight: "1" }}>{value}</span>
                    )}
                </s-stack>
            </div>
        </s-section>
    );
}
