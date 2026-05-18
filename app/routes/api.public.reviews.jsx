import { authenticate } from "../shopify.server";
import { getPublishedReviews, createPublicReview, voteReview } from "../services/publicReview.server";

export async function loader({ request }) {
    console.log("============= PUBLIC REVIEWS LOADER TRIGGERED ==============");
    console.log("URL:", request.url);

    try {
        const authResult = await authenticate.public.appProxy(request);
        console.log("App Proxy Authentication Successful!");
    } catch (authError) {
        console.error("App Proxy Authentication FAILED:", authError);
        return Response.json({ reviews: [], error: "Auth failed", details: authError.message });
    }

    // Get parameters from URL
    const url = new URL(request.url);
    let productId = url.searchParams.get("productId");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 3;
    const type = url.searchParams.get("type") || "PRODUCT";
    const sort = url.searchParams.get("sort") || "Newest";
    const search = url.searchParams.get("q") || "";

    console.log(`Params -> productId=${productId}, page=${page}, type=${type}, sort=${sort}`);

    if (!productId) {
        productId = "STORE";
    }

    try {
        console.log(`Calling getPublishedReviews...`);
        const result = await getPublishedReviews(productId, page, limit, type, sort, search);
        console.log(`Query successful, returning ${result.reviews.length} reviews`);
        return Response.json(result);
    } catch (error) {
        console.error("Error fetching reviews from DB:", error);
        return Response.json({ reviews: [], stats: null, pagination: null }, { status: 500 });
    }
}

export async function action({ request }) {
    await authenticate.public.appProxy(request);

    // Extract shop from Shopify app proxy request
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "unknown";

    let data;
    try {
        data = await request.json();
    } catch {
        const formData = await request.formData();
        data = Object.fromEntries(formData);
    }

    // Handle helpful / unhelpful voting
    if (data.action === "vote") {
        const { reviewId, voteType } = data;
        if (!reviewId || !voteType) {
            return Response.json({ error: "Missing vote parameters" }, { status: 400 });
        }
        try {
            await voteReview(reviewId, voteType);
            return Response.json({ success: true });
        } catch (error) {
            console.error("Error voting:", error);
            return Response.json({ error: "Failed to vote" }, { status: 500 });
        }
    }

    // Handle Review Submission
    const { productId, rating, comment, customerName, email, photos, type } = data;

    if (!productId || !rating || !comment || !email) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        await createPublicReview({ shop, productId, rating, comment, customerName, email, photos, type });
        return Response.json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
        console.error("Error creating review:", error);
        return Response.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
