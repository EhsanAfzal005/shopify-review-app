import prisma from "./db.server";

// Available subscription plans
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["Up to 50 reviews", "Basic support"],
  },
  BASIC: {
    name: "Basic",
    price: 4.99,
    features: ["Up to 500 reviews", "Email support", "Photo reviews"],
  },
  PRO: {
    name: "Pro",
    price: 9.99,
    features: ["Unlimited reviews", "Priority support", "Photo reviews", "Review import"],
  },
};

/**
 * Check if a store has an active billing subscription
 * Auto-creates FREE tier for new stores
 * Fetches owner details if admin context is provided and details are missing
 */
export async function checkBillingStatus(shop, admin = null) {
  let billing = await prisma.billingDetail.findUnique({
    where: { shop },
  });

  // Helper function to fetch shop owner details via GraphQL
  async function fetchOwnerDetails(adminContext) {
    try {
      console.log("Attempting to fetch shop owner details via GraphQL...");
      const response = await adminContext.graphql(
        `#graphql
          query {
            shop {
              name
              email
              shopOwnerName
            }
          }
        `
      );
      const data = await response.json();
      console.log("Shop GraphQL Response:", JSON.stringify(data, null, 2));
      
      if (data?.data?.shop) {
        return {
          ownerName: data.data.shop.shopOwnerName,
          email: data.data.shop.email
        };
      }
    } catch (error) {
      console.error("Error fetching shop details via GraphQL:", error.message || error);
    }
    return { ownerName: null, email: null };
  }

  // Auto-create FREE tier for new stores
  if (!billing) {
    console.log(`Auto-creating FREE tier for new store: ${shop}`);
    
    let ownerDetails = { ownerName: null, email: null };
    
    // Try to fetch owner details if admin context is provided
    if (admin) {
      ownerDetails = await fetchOwnerDetails(admin);
      if (ownerDetails.ownerName) {
        console.log(`Fetched owner details for ${shop}: ${ownerDetails.ownerName} (${ownerDetails.email})`);
      }
    } else {
      console.log("No admin context provided, skipping owner details fetch");
    }

    billing = await prisma.billingDetail.create({
      data: {
        shop,
        planName: "Free",
        planType: "FREE",
        status: "ACTIVE",
        price: 0,
        currency: "USD",
        activatedAt: new Date(),
        ownerName: ownerDetails.ownerName,
        email: ownerDetails.email
      },
    });

    // Send Welcome Email
    if (ownerDetails.email) {
      console.log(`Sending welcome email to ${ownerDetails.email}...`);
      import("./mailer.server").then(({ sendWelcomeEmail }) => {
        sendWelcomeEmail(ownerDetails.email, shop).catch(err => 
          console.error("Failed to send welcome email:", err)
        );
      });
    }
  } else if (admin && (!billing.ownerName || !billing.email)) {
    // If billing exists but missing details, try to update them
    console.log("Billing exists but missing owner details, attempting to update...");
    const ownerDetails = await fetchOwnerDetails(admin);
    if (ownerDetails.ownerName || ownerDetails.email) {
      billing = await prisma.billingDetail.update({
        where: { shop },
        data: {
          ownerName: ownerDetails.ownerName,
          email: ownerDetails.email
        }
      });
      console.log(`Updated missing owner details for ${shop}: ${ownerDetails.ownerName} (${ownerDetails.email})`);
    }
  }

  const isFreePlan = billing.planName === "Free" || billing.price === 0;
  const isActive = isFreePlan || billing.status === "ACTIVE";
  const isInTrial = billing.trialEndsAt && new Date(billing.trialEndsAt) > new Date();

  return {
    hasActiveSubscription: isActive || isInTrial,
    plan: billing.planName,
    status: billing.status,
    trialEndsAt: billing.trialEndsAt,
    currentPeriodEnd: billing.currentPeriodEnd,
  };
}

/**
 * Create a subscription via Shopify Billing API
 */
export async function createSubscription(admin, planName, returnUrl) {
  // ... (unchanged)
  const plan = PLANS[planName];
  if (!plan || plan.price === 0) {
    throw new Error("Invalid plan or free plan selected");
  }

  const response = await admin.graphql(
    `#graphql
      mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          lineItems: $lineItems
          test: true
        ) {
          appSubscription {
            id
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        name: `${plan.name} Plan`,
        returnUrl,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: plan.price, currencyCode: "USD" },
                interval: "EVERY_30_DAYS",
              },
            },
          },
        ],
      },
    }
  );

  const data = await response.json();
  const { appSubscriptionCreate } = data.data;

  if (appSubscriptionCreate.userErrors.length > 0) {
    throw new Error(appSubscriptionCreate.userErrors[0].message);
  }

  return {
    subscriptionId: appSubscriptionCreate.appSubscription.id,
    confirmationUrl: appSubscriptionCreate.confirmationUrl,
  };
}

/**
 * Confirm subscription and store billing details in MongoDB
 */
export async function confirmAndStoreBilling(admin, shop, chargeId) {
  // Query the subscription status from Shopify
  const response = await admin.graphql(
    `#graphql
      query getSubscription($id: ID!) {
        node(id: $id) {
          ... on AppSubscription {
            id
            name
            status
            createdAt
            currentPeriodEnd
            trialDays
            lineItems(first: 1) {
              edges {
                node {
                  plan {
                    pricingDetails {
                      ... on AppRecurringPricing {
                        price {
                          amount
                          currencyCode
                        }
                        interval
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: { id: chargeId },
    }
  );

  const data = await response.json();
  const subscription = data.data?.node;

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Fetch shop details for owner info via GraphQL
  let ownerDetails = { ownerName: null, email: null };
  try {
    const shopResponse = await admin.graphql(
      `#graphql
        query {
          shop {
            email
            shopOwnerName
          }
        }
      `
    );
    const shopData = await shopResponse.json();
    if (shopData?.data?.shop) {
      ownerDetails.ownerName = shopData.data.shop.shopOwnerName;
      ownerDetails.email = shopData.data.shop.email;
    }
  } catch (error) {
    console.error("Error fetching shop details during confirmation:", error.message || error);
  }

  const lineItem = subscription.lineItems?.edges?.[0]?.node;
  const pricing = lineItem?.plan?.pricingDetails;

  // Upsert billing record in MongoDB
  const billingData = {
    shop,
    shopifyChargeId: subscription.id,
    planName: subscription.name.replace(" Plan", ""),
    planType: "RECURRING",
    status: subscription.status === "ACTIVE" ? "ACTIVE" : "PENDING",
    price: parseFloat(pricing?.price?.amount || 0),
    currency: pricing?.price?.currencyCode || "USD",
    billingInterval: pricing?.interval === "EVERY_30_DAYS" ? "MONTHLY" : "ANNUAL",
    trialDays: subscription.trialDays || 0,
    trialEndsAt: subscription.trialDays
      ? new Date(Date.now() + subscription.trialDays * 24 * 60 * 60 * 1000)
      : null,
    activatedAt: new Date(),
    currentPeriodEnd: subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : null,
    ownerName: ownerDetails.ownerName,
    email: ownerDetails.email
  };

  const billing = await prisma.billingDetail.upsert({
    where: { shop },
    update: billingData,
    create: billingData,
  });

  return billing;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(shop) {
  return await prisma.billingDetail.update({
    where: { shop },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });
}
