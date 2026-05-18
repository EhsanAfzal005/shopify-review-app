/**
 * RatingDistribution — 5-star horizontal bar chart.
 *
 * Props:
 *   distribution  {object}  { 1: count, 2: count, 3: count, 4: count, 5: count }
 */
export default function RatingDistribution({ distribution }) {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading level="2">Rating Distribution</s-heading>
                <s-stack gap="tight">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = distribution[stars];
                        const percent = (count / total) * 100;
                        return (
                            <div key={stars} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ display: "flex", gap: "2px", minWidth: "90px" }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span key={i} style={{
                                            color: i <= stars ? "#D32F2F" : "#E0E0E0",
                                            fontSize: "14px",
                                        }}>★</span>
                                    ))}
                                </div>
                                <div style={{
                                    flex: 1, height: "10px",
                                    backgroundColor: "#FFEBEE", borderRadius: "5px",
                                    overflow: "hidden",
                                }}>
                                    <div style={{
                                        width: `${percent}%`, height: "100%",
                                        background: "linear-gradient(90deg, #EF5350, #D32F2F)",
                                        borderRadius: "5px",
                                        transition: "width 0.3s ease",
                                    }} />
                                </div>
                                <s-text tone="subdued" style={{ minWidth: "30px", textAlign: "right" }}>
                                    {count}
                                </s-text>
                            </div>
                        );
                    })}
                </s-stack>
            </s-stack>
        </s-section>
    );
}
