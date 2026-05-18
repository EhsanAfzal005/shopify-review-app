import { authenticate } from "../shopify.server";
import { redactShopData } from "../services/webhook.server";

/**
 * Mandatory compliance webhook: shop/redact
 * Shopify sends this 48 hours after an app is uninstalled.
 * We must delete ALL data associated with this shop.
 */
export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);
    console.log(`📦 Received ${topic} webhook for ${shop}`);

    const result = await redactShopData(shop);
    console.log(`✅ Redacted all shop data for ${shop}:`, result);
  } catch (err) {
    console.error("❌ SHOP_REDACT webhook error:", err);
  }

  return new Response("OK", { status: 200 });
};
