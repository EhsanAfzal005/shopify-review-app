
export default function WarningBanner({ shop }) {
    const extensionUuid = "3da5f728-520a-de66-9452-dfbd9b732ec89533f7cf";
    const blockHandle = "reviews";
    const shopName = shop ? shop.replace(".myshopify.com", "") : "";

    // Deep link to open the theme editor with the app block add panel
    const deepLink = `https://admin.shopify.com/store/${shopName}/themes/current/editor?template=product&addAppBlockId=${extensionUuid}/${blockHandle}&target=mainSection`;

    return (
        <s-card background="bg-surface-warning" padding="300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
                    <s-text>
                        <b>Action Required:</b> Please add the <b>Customer Reviews</b> block to your product page to display reviews.
                    </s-text>
                </div>
                <div style={{ flexShrink: 0 }}>
                    <s-button href={deepLink} target="_blank">
                        Add to Theme
                    </s-button>
                </div>
            </div>
        </s-card>
    );
}
