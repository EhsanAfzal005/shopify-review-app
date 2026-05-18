import db from "../db.server";

/**
 * Delete all sessions for a shop (used on app uninstall).
 */
export async function deleteSessionsByShop(shop) {
  try {
    const result = await db.session.deleteMany({ where: { shop } });
    console.log(`✅ Deleted sessions for ${shop}:`, result);
    return result;
  } catch (err) {
    console.error(`❌ Failed to delete sessions for ${shop}:`, err);
    return null;
  }
}

/**
 * Mark a shop's billing as cancelled (used on app uninstall).
 * Uses updateMany so it won't throw if record doesn't exist.
 */
export async function cancelBilling(shop) {
  try {
    const result = await db.billingDetail.updateMany({
      where: { shop },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    console.log(`✅ Billing cancelled for ${shop}:`, result);
    return result;
  } catch (err) {
    console.error(`❌ Failed to cancel billing for ${shop}:`, err);
    return null;
  }
}

/**
 * Fetch billing details for a shop (email, ownerName).
 */
export async function getBillingDetails(shop) {
  try {
    return await db.billingDetail.findUnique({
      where: { shop },
      select: { email: true, ownerName: true },
    });
  } catch (err) {
    console.error(`❌ Failed to get billing details for ${shop}:`, err);
    return null;
  }
}

/**
 * Delete all reviews associated with a product (used when product is deleted).
 * Handles both numeric ID and GID format.
 */
export async function deleteReviewsByProduct(productId) {
  try {
    const gid = `gid://shopify/Product/${productId}`;
    const result = await db.review.deleteMany({
      where: {
        OR: [
          { productId: String(productId) },
          { productId: gid },
        ],
      },
    });
    console.log(`✅ Deleted reviews for product ${productId}:`, result);
    return result;
  } catch (err) {
    console.error(`❌ Failed to delete reviews for product ${productId}:`, err);
    return null;
  }
}

/**
 * Fetch all stored data for a customer by email (used for customers/data_request).
 */
export async function getCustomerData(shop, customerEmail) {
  try {
    const reviews = await db.review.findMany({
      where: {
        shop,
        userEmail: customerEmail,
      },
      select: {
        id: true,
        productId: true,
        username: true,
        userEmail: true,
        rating: true,
        comment: true,
        photos: true,
        createdAt: true,
        type: true,
      },
    });

    return {
      customerEmail,
      shop,
      reviewsCount: reviews.length,
      reviews,
    };
  } catch (err) {
    console.error(`❌ Failed to get customer data for ${customerEmail}:`, err);
    return null;
  }
}

/**
 * Anonymize/redact customer data (used for customers/redact).
 * Replaces personal identifiers but keeps the review content for analytics.
 */
export async function redactCustomerData(shop, customerEmail) {
  try {
    const result = await db.review.updateMany({
      where: {
        shop,
        userEmail: customerEmail,
      },
      data: {
        username: "[redacted]",
        userEmail: "[redacted]",
      },
    });

    console.log(
      `✅ Redacted ${result.count} reviews for customer ${customerEmail} at ${shop}`
    );
    return result;
  } catch (err) {
    console.error(
      `❌ Failed to redact customer data for ${customerEmail}:`,
      err
    );
    return null;
  }
}

/**
 * Delete ALL data for a shop (used for shop/redact).
 * Called 48 hours after app uninstall when Shopify requests full data erasure.
 */
export async function redactShopData(shop) {
  try {
    const [reviews, billing, sessions] = await Promise.all([
      db.review.deleteMany({ where: { shop } }),
      db.billingDetail.deleteMany({ where: { shop } }),
      db.session.deleteMany({ where: { shop } }),
    ]);

    const result = {
      reviewsDeleted: reviews.count,
      billingDeleted: billing.count,
      sessionsDeleted: sessions.count,
    };

    console.log(`✅ Shop redact complete for ${shop}:`, result);
    return result;
  } catch (err) {
    console.error(`❌ Failed to redact shop data for ${shop}:`, err);
    return null;
  }
}