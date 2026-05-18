// ─── Shopify GraphQL Product Queries ────────────────────────────────

/**
 * Search Shopify products by title. Returns an array of matching product IDs
 * in both GID and numeric formats.
 */
export async function searchProductsByTitle(admin, query) {
    try {
        const response = await admin.graphql(
            `#graphql
            query searchProducts($query: String!) {
                products(first: 50, query: $query) {
                    nodes { id }
                }
            }`,
            { variables: { query: `title:*${query}*` } },
        );
        const { data } = await response.json();
        return (data?.products?.nodes || []).map(node => {
            const numericId = node.id.replace("gid://shopify/Product/", "");
            return [node.id, numericId];
        }).flat();
    } catch (error) {
        console.error("Error searching products by title:", error);
        return [];
    }
}

/**
 * Fetch multiple products by their IDs via Shopify GraphQL.
 * Returns an array of product nodes with title, handle, onlineStoreUrl, and featuredImage.
 */
export async function fetchProductsByIds(admin, productIds) {
    if (!productIds || productIds.length === 0) return [];

    // Normalize IDs to GID format
    const gids = productIds.map(id => {
        if (id && !id.startsWith("gid://")) return `gid://shopify/Product/${id}`;
        return id;
    }).filter(Boolean);

    const uniqueGids = [...new Set(gids)];
    if (uniqueGids.length === 0) return [];

    try {
        const response = await admin.graphql(
            `#graphql
            query getProducts($ids: [ID!]!) {
                nodes(ids: $ids) {
                    ... on Product {
                        id
                        title
                        handle
                        onlineStoreUrl
                        featuredImage { url }
                    }
                }
            }`,
            { variables: { ids: uniqueGids } },
        );
        const { data: { nodes } } = await response.json();
        return nodes.filter(Boolean);
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}

/**
 * Build a product map { gid → { title, image, handle, onlineStoreUrl } }
 * from a list of raw product IDs (numeric or GID).
 */
export async function buildProductMap(admin, productIds) {
    const nodes = await fetchProductsByIds(admin, productIds);
    return nodes.reduce((acc, node) => {
        acc[node.id] = {
            title: node.title,
            image: node.featuredImage?.url,
            handle: node.handle,
            onlineStoreUrl: node.onlineStoreUrl,
        };
        return acc;
    }, {});
}

/**
 * Fetch a single product's title and featured image by its ID.
 */
export async function fetchSingleProduct(admin, productId) {
    if (!productId) return { title: "Unknown Product", image: null };

    const gid = productId.startsWith("gid://")
        ? productId
        : `gid://shopify/Product/${productId}`;

    try {
        const response = await admin.graphql(
            `#graphql
            query getProduct($id: ID!) {
                product(id: $id) {
                    title
                    featuredImage { url }
                }
            }`,
            { variables: { id: gid } },
        );
        const { data } = await response.json();
        if (data?.product) {
            return {
                title: data.product.title,
                image: data.product.featuredImage?.url,
            };
        }
    } catch (error) {
        console.error("Error fetching product:", error);
    }

    return { title: "Unknown Product", image: null };
}

/**
 * Helper: look up a product from a pre-built product map.
 * Falls back to default values if not found.
 */
export function getProductDetails(productMap, id) {
    const gid = id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;
    return productMap[gid] || { title: "Unknown Product", image: null, handle: null, onlineStoreUrl: null };
}
