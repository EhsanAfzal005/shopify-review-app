import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { confirmAndStoreBilling } from "../billing.server";
import { sendWelcomeEmail } from "../mailer.server";

export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    const url = new URL(request.url);
    const chargeId = url.searchParams.get("charge_id");

    if (!chargeId) {
        console.error("No charge_id in callback URL");
        url.pathname = "/app/billing";
        url.searchParams.set("error", "missing_charge");
        return redirect(url.toString());
    }

    try {
        // Confirm subscription and store billing details in MongoDB
        const billing = await confirmAndStoreBilling(admin, shop, chargeId);

        console.log(`Billing stored for ${shop}:`, {
            plan: billing.planName,
            status: billing.status,
            price: billing.price,
        });

        // Send Welcome Email
        if (billing.email) {
            console.log(`Sending welcome email to ${billing.email}...`);
            // Fire and forget to avoid blocking redirect
            sendWelcomeEmail(billing.email, shop).catch(err =>
                console.error("Failed to send welcome email:", err)
            );
        }

        // Redirect to dashboard with success message
        url.pathname = "/app";
        url.searchParams.set("billing", "success");
        return redirect(url.toString());
    } catch (error) {
        console.error("Error confirming billing:", error);
        url.pathname = "/app/billing";
        url.searchParams.set("error", error.message);
        return redirect(url.toString());
    }
};

// No UI needed - this is just a redirect handler
export default function BillingCallback() {
    return null;
}
