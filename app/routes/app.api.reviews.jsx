import { authenticate } from "../shopify.server";
import { getAllReviews, adminUpdateReview } from "../services/adminReview.server";
import { getShopDomain } from "../services/shop.server";

export async function loader({ request }) {
    const { admin, session } = await authenticate.admin(request);
    const shop = await getShopDomain(admin, session);

    try {
        const reviews = await getAllReviews(shop);
        return Response.json({ reviews });
    } catch (error) {
        console.error("Error fetching admin reviews:", error);
        return Response.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function action({ request }) {
    await authenticate.admin(request);
    const formData = await request.formData();
    const actionType = formData.get("actionType"); // "delete", "draft", "reply"
    const id = formData.get("id");

    if (!id) {
        return Response.json({ error: "Review ID required" }, { status: 400 });
    }

    try {
        const result = await adminUpdateReview(id, actionType, {
            approved: formData.get("approved"),
            reply: formData.get("reply"),
        });

        if (result.error) {
            return Response.json({ error: result.error }, { status: 400 });
        }

        return Response.json(result);
    } catch (error) {
        console.error(`Error performing ${actionType} on review:`, error);
        return Response.json({ error: `Failed to ${actionType} review` }, { status: 500 });
    }
}
