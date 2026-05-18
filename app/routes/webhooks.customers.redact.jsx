import { authenticate } from "../shopify.server";
import { redactCustomerData } from "../services/webhook.server";

/**
 * Mandatory compliance webhook: customers/redact
 * Shopify sends this when a customer requests erasure of their data.
 * We must delete or anonymize all personal data for this customer.
 */
export const action = async ({ request }) => {
  try {
    const { shop, topic, payload } = await authenticate.webhook(request);
    console.log(`📦 Received ${topic} webhook for ${shop}`);

    const customerEmail = payload?.customer?.email;

    if (customerEmail) {
      const result = await redactCustomerData(shop, customerEmail);
      console.log(
        `✅ Redacted customer data for ${customerEmail} at ${shop}:`,
        result
      );
    } else {
      console.log(`⚠️ No customer email in redact payload for ${shop}`);
    }
  } catch (err) {
    console.error("❌ CUSTOMERS_REDACT webhook error:", err);
  }

  return new Response("OK", { status: 200 });
};
