import { getPublishedReviewsByProductId, createReview } from "../services/adminReview.server";
import { cors } from "../utils/cors";

// GET: Fetch reviews for a specific product
export async function loader({ request }) {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const shop = url.searchParams.get("shop");

    if (!productId) {
        return cors(request, Response.json({ error: "Product ID is required" }, { status: 400 }));
    }

    try {
        const reviews = await getPublishedReviewsByProductId(productId, shop);
        return cors(request, Response.json({ reviews }));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return cors(request, Response.json({ error: "Failed to fetch reviews" }, { status: 500 }));
    }
}

// POST: Submit a new review
export async function action({ request }) {
    if (request.method !== "POST") {
        return cors(request, Response.json({ error: "Method not allowed" }, { status: 405 }));
    }

    try {
        const body = await request.json();
        const { shop, productId, username, userEmail, rating, comment, orderId } = body;

        // Basic validation
        if (!productId || !username || !userEmail || !rating || !comment) {
            return cors(request, Response.json({ error: "Missing required fields" }, { status: 400 }));
        }

        const review = await createReview({ shop, productId, username, userEmail, rating, comment, orderId });
        return cors(request, Response.json({ success: true, review }, { status: 201 }));
    } catch (error) {
        console.error("Error creating review:", error);
        return cors(request, Response.json({ error: "Failed to create review" }, { status: 500 }));
    }
}

// Handle OPTIONS requests for CORS
export async function options({ request }) {
    return cors(request, new Response(null, { status: 204 }));
}
