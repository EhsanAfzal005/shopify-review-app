import { authenticate } from "../shopify.server";
import { sendUninstallEmail } from "../mailer.server";
import {
  getBillingDetails,
  deleteSessionsByShop,
  cancelBilling,
} from "../services/webhook.server";

export const action = async ({ request }) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);
    console.log(`📦 Received ${topic} webhook for ${shop}`);

    if (session) {
      // Get billing details for uninstall email
      const billing = await getBillingDetails(shop);

      if (billing?.email) {
        console.log(`📧 Sending uninstall email to ${billing.email}...`);
        sendUninstallEmail(billing.email, shop).catch((err) =>
          console.error("❌ Failed to send uninstall email:", err)
        );
      }

      // Delete sessions first
      await deleteSessionsByShop(shop);

      // Cancel billing — now safe, won't throw if record missing
      await cancelBilling(shop);

      console.log(`✅ Uninstall cleanup complete for ${shop}`);
    } else {
      // Session already deleted (webhook fired multiple times) — safe to ignore
      console.log(`⚠️ No session found for ${shop}, skipping cleanup (already processed)`);
    }
  } catch (err) {
    // Always return 200 to Shopify even on error, otherwise it will keep retrying
    console.error("❌ APP_UNINSTALLED webhook error:", err);
  }

  // Always return 200
  return new Response("OK", { status: 200 });
};