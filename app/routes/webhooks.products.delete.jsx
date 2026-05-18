import { authenticate } from "../shopify.server";
import { deleteReviewsByProduct } from "../services/webhook.server";

export const action = async ({ request }) => {
    const { topic, shop, session, admin, payload } = await authenticate.webhook(
        request
    );

    if (!admin) {
        // The admin context isn't returned if the webhook fired after a shop was uninstalled.
        throw new Response("OK", { status: 200 });
    }

    // The topics handled here should be declared in the shopify.app.toml.
    // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
    switch (topic) {
        case "PRODUCTS_DELETE":
            if (payload?.id) {
                console.log(`Processing PRODUCTS_DELETE for product ${payload.id}`);
                await deleteReviewsByProduct(payload.id);
            }
            break;
        default:
            throw new Response("Unhandled webhook topic", { status: 404 });
    }

    throw new Response("OK", { status: 200 });
};
