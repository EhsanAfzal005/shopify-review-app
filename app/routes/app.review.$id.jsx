import { useLoaderData, useSubmit, useNavigate, useActionData, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { CheckIcon, OrderDraftIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { getReviewById } from "../services/review.server";
import { draftReview, publishReview, deleteReview, replyToReview } from "../services/reviewActions.server";
import { fetchSingleProduct } from "../services/product.server";


export const loader = async ({ request, params }) => {
    const { admin } = await authenticate.admin(request);

    const review = await getReviewById(params.id);
    if (!review) {
        return { reviewNotFound: true };
    }

    // Fetch Product Details via service
    const product = await fetchSingleProduct(admin, review.productId);

    return {
        review: {
            ...review,
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
        },
        product,
    };
};

export const action = async ({ request, params }) => {
    await authenticate.admin(request);
    const formData = await request.formData();
    const actionType = formData.get("action");
    const reviewId = params.id;

    if (actionType === "draft") {
        await draftReview(reviewId);
        return { success: true, message: "Review drafted successfully" };
    } else if (actionType === "publish") {
        await publishReview(reviewId);
        return { success: true, message: "Review published successfully" };
    } else if (actionType === "delete") {
        await deleteReview(reviewId);
        return { success: true, deleted: true, message: "Review deleted successfully" };
    } else if (actionType === "reply") {
        const replyText = formData.get("replyText");
        await replyToReview(reviewId, replyText);
        return { success: true, message: "Reply updated successfully" };
    }

    return null;
};

export default function ReviewDetail() {
    const loaderData = useLoaderData();
    const submit = useSubmit();
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [replyText, setReplyText] = useState(loaderData?.review?.reply || "");
    const actionData = useActionData();
    const navigation = useNavigation();

    // Redirect to dashboard if review not found
    useEffect(() => {
        if (loaderData?.reviewNotFound) {
            shopify.toast.show("Review not found", { isError: true });
            navigate("/app");
        }
    }, [loaderData]);

    // Show toast on successful actions and navigate away on delete
    useEffect(() => {
        if (actionData?.success && navigation.state === "idle") {
            const message = actionData?.message || "Action completed successfully!";
            shopify.toast.show(message);
            if (actionData?.deleted) {
                navigate("/app");
            }
        }
    }, [actionData, navigation.state]);

    // Show spinner while redirecting for not-found reviews
    if (loaderData?.reviewNotFound) {
        return (
            <s-page heading="Redirecting...">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <s-spinner size="large" />
                </div>
            </s-page>
        );
    }

    const { review, product } = loaderData;

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        submit({ action: "delete" }, { method: "post" });
        setShowDeleteModal(false);
    };

    const handleReply = () => {
        submit({ action: "reply", replyText }, { method: "post" });
    };

    const isLoading = navigation.state === "loading" && navigation.formMethod == null;

    if (isLoading) {
        return (
            <s-page heading="Loading Dashboard...">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                    <s-spinner size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <s-text tone="subdued">Loading...</s-text>
                    </div>
                </div>
            </s-page>
        );
    }

    return (
        <s-page>
            <TitleBar title={`Review by ${review.username}`}>
                <button variant="breadcrumb" onClick={() => navigate(`/app${window.location.search}`)}>Dashboard</button>
                <button onClick={handleDelete} tone="critical">Delete</button>
                {review.approved ? (
                    <button onClick={() => submit({ action: "draft" }, { method: "post" })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <OrderDraftIcon style={{ width: '16px', height: '16px' }} /> Draft
                        </div>
                    </button>
                ) : (
                    <button variant="primary" onClick={() => submit({ action: "publish" }, { method: "post" })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckIcon style={{ width: '16px', height: '16px' }} /> Publish
                        </div>
                    </button>
                )}
            </TitleBar>

            {/* Delete Confirmation Modal */}
            <Modal id="delete-modal" open={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 20px 0", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>
                        Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                </div>
                <TitleBar title="Delete Review">
                    <button variant="primary" tone="critical" onClick={confirmDelete} disabled={navigation.state === "submitting"}>
                        {navigation.state === "submitting" ? "Deleting..." : "Delete"}
                    </button>
                    <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
                </TitleBar>
            </Modal >

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <s-section>
                    <s-stack gap="base">
                        {/* First Row: Product and Rating */}
                        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                            {/* Left Column - Product */}
                            <div style={{ flex: "1", minWidth: "0" }}>
                                <s-stack gap="tight">
                                    <s-heading level="2">Product</s-heading>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        {product.image && (
                                            <s-thumbnail
                                                source={product.image}
                                                alt={product.title}
                                                size="small"
                                            ></s-thumbnail>
                                        )}
                                        <s-text type="strong">{product.title}</s-text>
                                    </div>
                                </s-stack>
                            </div>

                            {/* Right Column - Rating */}
                            <div style={{ flex: "1", minWidth: "0" }}>
                                <s-stack gap="tight">
                                    <s-heading level="2">Rating</s-heading>
                                    <div style={{ display: "flex", alignItems: "center", height: "40px" }}>
                                        <s-badge tone={review.rating >= 4 ? "success" : review.rating === 3 ? "warning" : "critical"}>
                                            {review.rating} Stars
                                        </s-badge>
                                    </div>
                                </s-stack>
                            </div>
                        </div>

                        <s-divider></s-divider>

                        {/* Second Row: Review and Customer Info */}
                        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                            {/* Left Column - Review */}
                            <div style={{ flex: "1", minWidth: "0" }}>
                                <s-stack gap="tight">
                                    <s-heading level="2">Review</s-heading>
                                    <s-text>{review.comment}</s-text>
                                </s-stack>
                            </div>

                            {/* Right Column - Customer Info */}
                            <div style={{ flex: "1", minWidth: "0" }}>
                                <s-stack gap="tight">
                                    <s-heading level="2">Customer Info</s-heading>
                                    <s-text>{review.username} ({review.userEmail})</s-text>
                                </s-stack>
                            </div>
                        </div>

                        {/* Photos Section - Full Width */}
                        {review.photos && review.photos.length > 0 && (
                            <>
                                <s-divider></s-divider>
                                <s-stack gap="tight">
                                    <s-heading level="2">Photos ({review.photos.length})</s-heading>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                        {review.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`Review photo ${index + 1}`}
                                                onClick={() => setSelectedImage(photo)}
                                                style={{
                                                    width: '200px',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #dfe3e8',
                                                    backgroundColor: '#f4f6f8',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </s-stack>
                            </>
                        )}

                        {selectedImage && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    zIndex: 10000,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'zoom-out'
                                }}
                                onClick={() => setSelectedImage(null)}
                            >
                                <img
                                    src={selectedImage}
                                    alt="Full size"
                                    style={{
                                        maxWidth: '90vw',
                                        maxHeight: '90vh',
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </div>
                        )}

                        <s-divider></s-divider>

                        {/* Reply Section */}
                        <s-stack gap="base">
                            <s-heading level="2">Reply to Customer</s-heading>
                            <s-text-area
                                label="Your Reply"
                                value={replyText}
                                onInput={(e) => setReplyText(e.target.value)}
                                helpText="Your reply will be sent to the customer via email (if configured)."
                            ></s-text-area>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <s-button
                                    onClick={handleReply}
                                    disabled={!replyText.trim() || undefined}
                                    variant="primary"
                                >
                                    Update Reply
                                </s-button>
                            </div>
                        </s-stack>
                    </s-stack>
                </s-section>
            </div>
        </s-page>
    );
}
