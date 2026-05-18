/**
 * Resolves the shop domain from the session or via a GraphQL query.
 */
export async function getShopDomain(admin, session) {
  if (session?.shop) {
    return session.shop;
  }

  try {
    const response = await admin.graphql(`{ shop { url } }`);
    const { data } = await response.json();
    const shopDomain = data.shop.url.split("/").pop();
    return shopDomain;
  } catch (error) {
    console.error("[shop.server] Failed to resolve shop domain", error);
    throw new Error("Failed to resolve shop domain");
  }
}
