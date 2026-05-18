import { authenticate } from "../shopify.server";
import { getCustomerData } from "../services/webhook.server";

/**
 * Mandatory compliance webhook: customers/data_request
 * Shopify sends this when a customer requests their data.
 * We look up all data we store for the customer and log it.
 * If you store data externally, you'd email/send this data to the merchant.
 */
export const action = async ({ request }) => {
  try {
    const { shop, topic, payload } = await authenticate.webhook(request);
    console.log(`📦 Received ${topic} webhook for ${shop}`);

    const customerEmail = payload?.customer?.email;

    if (customerEmail) {
      const customerData = await getCustomerData(shop, customerEmail);
      console.log(
        `📋 Customer data request for ${customerEmail} at ${shop}:`,
        JSON.stringify(customerData, null, 2)
      );
    } else {
      console.log(`⚠️ No customer email in data_request payload for ${shop}`);
    }
  } catch (err) {
    console.error("❌ CUSTOMERS_DATA_REQUEST webhook error:", err);
  }

  return new Response("OK", { status: 200 });
};
