/**
 * TopProducts — Ranked list of most-reviewed products.
 *
 * Props:
 *   products  {array}  [{ title, count, handle, onlineStoreUrl }]
 *   shop      {string} Shop domain (used to build fallback product URLs)
 */
export default function TopProducts({ products, shop }) {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading level="2">Top Reviewed Products</s-heading>
                <s-stack gap="tight">
                    {products.length > 0 ? (
                        products.map((prod, idx) => {
                            const productUrl =
                                prod.onlineStoreUrl ||
                                (prod.handle ? `https://${shop}/products/${prod.handle}` : null);

                            return (
                                <div key={idx} style={{
                                    display: "flex", alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    backgroundColor: idx === 0 ? "#FFEBEE" : "transparent",
                                    borderRadius: "8px", border: "1px solid #FFCDD2",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            width: "24px", height: "24px",
                                            backgroundColor: idx === 0 ? "#D32F2F" : "#FFCDD2",
                                            color: idx === 0 ? "#fff" : "#B71C1C",
                                            borderRadius: "50%", fontSize: "12px", fontWeight: "bold",
                                        }}>{idx + 1}</span>
                                        {productUrl ? (
                                            <a
                                                href={productUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                                            >
                                                <s-text type="strong">{prod.title}</s-text>
                                            </a>
                                        ) : (
                                            <s-text type="strong">{prod.title}</s-text>
                                        )}
                                    </div>
                                    <span style={{
                                        backgroundColor: "#D32F2F", color: "#fff",
                                        padding: "4px 10px", borderRadius: "12px",
                                        fontSize: "12px", fontWeight: "600",
                                    }}>{prod.count} reviews</span>
                                </div>
                            );
                        })
                    ) : (
                        <s-text tone="subdued">No data yet.</s-text>
                    )}
                </s-stack>
            </s-stack>
        </s-section>
    );
}
