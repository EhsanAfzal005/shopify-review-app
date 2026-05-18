import { redirect } from "react-router";
import { useLoaderData, Form, useNavigation, useActionData, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import { PLANS, createSubscription, checkBillingStatus } from "../billing.server";

export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    // Check current billing status
    const billingStatus = await checkBillingStatus(shop, admin);

    return Response.json({
        plans: PLANS,
        currentPlan: billingStatus.plan,
        hasActiveSubscription: billingStatus.hasActiveSubscription,
        status: billingStatus.status,
        trialEndsAt: billingStatus.trialEndsAt,
    });
};

export const action = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const formData = await request.formData();
    const planName = formData.get("plan");

    console.log("Billing action triggered, plan:", planName);

    if (!planName || !PLANS[planName]) {
        return Response.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const plan = PLANS[planName];

    // Free plan - just update status
    if (plan.price === 0) {
        const redirectUrl = new URL(request.url);
        redirectUrl.pathname = "/app";
        return redirect(redirectUrl.toString());
    }

    try {
        // Get the return URL for after billing confirmation
        const url = new URL(request.url);
        const returnUrl = `${url.origin}/app/billing/callback?plan=${planName}`;

        console.log("Creating subscription with returnUrl:", returnUrl);

        // Create subscription via Shopify Billing API
        const { confirmationUrl } = await createSubscription(admin, planName, returnUrl);

        console.log("Redirecting to Shopify:", confirmationUrl);

        // Redirect to Shopify for merchant approval
        return redirect(confirmationUrl);
    } catch (error) {
        console.error("Billing error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
};

export default function BillingPage() {
    const { plans, currentPlan, hasActiveSubscription, status, trialEndsAt } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const [searchParams] = useSearchParams();
    const isLoading = navigation.state === "submitting";

    // Check if redirected from protected route
    const redirectReason = searchParams.get("reason");
    const requiresSubscription = redirectReason === "no_subscription";

    return (
        <s-page heading="Subscription Plans">
            {hasActiveSubscription && (
                <s-link slot="breadcrumb-actions" href="/app">Reviews</s-link>
            )}

            <s-stack gap="base">
                {requiresSubscription && !hasActiveSubscription && (
                    <s-banner tone="warning">
                        Please subscribe to a plan to access the dashboard and manage reviews.
                    </s-banner>
                )}

                {actionData?.error && (
                    <s-banner tone="critical">
                        {actionData.error}
                    </s-banner>
                )}

                {hasActiveSubscription && (
                    <s-banner tone="success">
                        You are currently on the <strong>{currentPlan}</strong> plan.
                        {status === "ACTIVE" && " Your subscription is active."}
                        {trialEndsAt && ` Trial ends: ${new Date(trialEndsAt).toLocaleDateString()}`}
                    </s-banner>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '20px',
                    alignItems: 'stretch'
                }}>
                    {Object.entries(plans).map(([key, plan]) => (
                        <div key={key} style={{ height: '100%' }}>
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                border: currentPlan === plan.name ? '2px solid #008060' : '1px solid #dfe3e8',
                                borderRadius: '16px',
                                boxShadow: currentPlan === plan.name ? '0 8px 24px rgba(0,128,96,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                                padding: '24px',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                backgroundColor: '#fff'
                            }}>
                                {currentPlan === plan.name && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '6px',
                                        backgroundColor: '#008060'
                                    }} />
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <h2 style={{
                                            margin: 0,
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            color: '#202223',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                                        }}>
                                            {plan.name}
                                        </h2>
                                        {currentPlan === plan.name && (
                                            <s-badge tone="success">Current Plan</s-badge>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: '900', color: '#1a1a1a', lineHeight: '1' }}>
                                            ${plan.price}
                                        </span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#6d7175' }}>/month</span>
                                    </div>

                                    <div style={{ flex: 1, textAlign: 'left', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {plan.features.map((feature, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                                    <div style={{
                                                        minWidth: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#E3F1DF',
                                                        color: '#008060',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: '900',
                                                        flexShrink: 0
                                                    }}>✓</div>
                                                    <span style={{ fontWeight: '600', fontSize: '1rem', color: '#4a4a4a', lineHeight: '1.4' }}>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Form method="post" style={{ marginTop: 'auto', width: '100%' }}>
                                        <input type="hidden" name="plan" value={key} />
                                        <s-button
                                            type="submit"
                                            variant={plan.price === 0 ? "secondary" : "primary"}
                                            inlineSize="fill"
                                            disabled={currentPlan === plan.name || isLoading || undefined}
                                            style={{ fontWeight: '700', padding: '12px' }}
                                        >
                                            {isLoading
                                                ? "Processing..."
                                                : currentPlan === plan.name
                                                    ? "Current Plan"
                                                    : plan.price === 0
                                                        ? "Downgrade"
                                                        : "Subscribe"}
                                        </s-button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </s-stack>
        </s-page>
    );
}
