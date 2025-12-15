# Quick Reference Guide: Commercialization Implementation

## Architecture Decisions

### Payment Provider
- **Choice:** Stripe
- **Reason:** Industry standard, excellent documentation, webhook support
- **Alternatives Considered:** Paddle, LemonSqueezy

### Subscription Model
- **Tiers:** Free, Pro ($29/mo or $290/yr), Enterprise (custom)
- **Billing Cycles:** Monthly and Annual
- **Trial Period:** 7 days for new users

### Database
- **Provider:** PostgreSQL (already in use)
- **ORM:** Prisma
- **New Models:** Subscription, Payment, Usage, SubscriptionPlan

### Email Service
- **Recommended:** Resend (simple, developer-friendly)
- **Alternatives:** SendGrid, AWS SES

---

## Key Files & Directories

### New Files to Create
```
src/server/subscription/
  ├── types.ts
  ├── plans.ts
  ├── limits.ts
  └── service.ts

src/server/stripe/
  ├── client.ts
  ├── products.ts
  └── webhooks.ts

src/server/usage/
  ├── tracker.ts
  └── limits.ts

src/components/subscription/
  ├── Paywall.tsx
  ├── UpgradePrompt.tsx
  └── FeatureGate.tsx

src/components/pricing/
  ├── PricingCard.tsx
  ├── FeatureList.tsx
  └── PlanComparison.tsx

src/app/pricing/
  ├── page.tsx
  ├── success/page.tsx
  └── cancel/page.tsx

src/app/api/stripe/
  ├── checkout/route.ts
  ├── webhook/route.ts
  └── portal/route.ts
```

### Files to Modify
- `prisma/schema.prisma` - Add subscription models
- `src/middleware.ts` - Add subscription checks
- `src/server/auth.ts` - Update session with subscription info
- `src/app/api/presentation/generate/route.ts` - Add access control
- `src/app/api/presentation/outline/route.ts` - Add access control
- `src/app/_actions/presentation/presentationActions.ts` - Add usage tracking
- `src/env.js` - Add Stripe and email env vars

---

## Environment Variables

### New Variables Required
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend example)
RESEND_API_KEY=re_...

# Optional: Analytics
POSTHOG_KEY=ph_...
POSTHOG_HOST=https://app.posthog.com
```

---

## Subscription Status Flow

```
New User Signup
  ↓
TRIAL (7 days)
  ↓
┌─────────────────┐
│ Payment Success? │
└─────────────────┘
  ↓ Yes          ↓ No
ACTIVE         EXPIRED
  ↓
┌─────────────────┐
│ Cancel Request? │
└─────────────────┘
  ↓ Yes
CANCELLED (access until period end)
```

---

## Feature Access Logic

```typescript
// Pseudo-code for access checking
function checkAccess(userId, feature) {
  subscription = getUserSubscription(userId)
  
  if (!subscription) {
    return { hasAccess: false, plan: "FREE" }
  }
  
  if (subscription.status === "ACTIVE") {
    plan = subscription.plan
    if (plan.features[feature]) {
      usage = getUsage(userId, feature)
      limit = plan.limits[feature]
      
      if (limit === -1 || usage < limit) {
        return { hasAccess: true, remaining: limit - usage }
      }
      return { hasAccess: false, reason: "Limit exceeded" }
    }
    return { hasAccess: false, reason: "Feature not in plan" }
  }
  
  if (subscription.status === "TRIAL" && trialValid) {
    return { hasAccess: true, plan: subscription.plan }
  }
  
  return { hasAccess: false, reason: "Subscription expired" }
}
```

---

## Usage Tracking Features

### Tracked Features
- `presentations_created` - Number of presentations created
- `api_calls` - AI API calls made
- `images_generated` - Images generated
- `storage_mb` - Storage used in MB

### Usage Period
- Monthly tracking (YYYY-MM format)
- Resets on 1st of each month
- Tracked per user per feature per period

---

## API Endpoint Protection Pattern

```typescript
// Standard pattern for protecting endpoints
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription access
  const hasAccess = await hasActiveSubscription(session.user.id);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Subscription required", code: "SUBSCRIPTION_REQUIRED" },
      { status: 402 }
    );
  }

  // Check feature access
  const featureAccess = await checkFeatureAccess(
    session.user.id,
    "presentations_created"
  );
  if (!featureAccess.hasAccess) {
    return NextResponse.json(
      { error: featureAccess.reason, code: "FEATURE_LIMIT_EXCEEDED" },
      { status: 403 }
    );
  }

  // Check usage limit
  const usageCheck = await checkUsageLimit(
    session.user.id,
    "presentations_created"
  );
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { error: "Usage limit exceeded", remaining: usageCheck.remaining },
      { status: 429 }
    );
  }

  // Process request
  // ...

  // Increment usage
  await incrementUsage(session.user.id, "presentations_created");

  return NextResponse.json({ success: true });
}
```

---

## Stripe Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription, activate access |
| `customer.subscription.updated` | Update subscription status, plan |
| `customer.subscription.deleted` | Cancel subscription, revoke access |
| `invoice.payment_succeeded` | Record payment, extend subscription |
| `invoice.payment_failed` | Notify user, handle retry |

---

## Plan Features Matrix

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Presentations/month | 3 | Unlimited | Unlimited |
| Export PPTX | ❌ | ✅ | ✅ |
| Custom Themes | ❌ | ✅ | ✅ |
| Premium Images | ❌ | ✅ | ✅ |
| Max Slides | 20 | Unlimited | Unlimited |
| API Calls/month | 50 | Unlimited | Unlimited |
| Images/month | 20 | Unlimited | Unlimited |
| Storage | 100 MB | 1 GB | Unlimited |
| Support | Community | Priority | Dedicated |
| Custom Branding | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| SLA | ❌ | ❌ | ✅ |

---

## Common Patterns

### Check Subscription in Component
```typescript
import { useSubscription } from "@/hooks/useSubscription";

function MyComponent() {
  const { subscription, isLoading } = useSubscription();
  
  if (isLoading) return <Loading />;
  if (!subscription || subscription.status !== "ACTIVE") {
    return <UpgradePrompt />;
  }
  
  return <ProtectedFeature />;
}
```

### Gate Feature with Component
```typescript
import { FeatureGate } from "@/components/subscription/FeatureGate";

function MyPage() {
  return (
    <FeatureGate feature="canExportPPTX">
      <ExportButton />
    </FeatureGate>
  );
}
```

### Server Action with Access Check
```typescript
"use server";

export async function myAction() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const access = await checkFeatureAccess(
    session.user.id,
    "my_feature"
  );
  
  if (!access.hasAccess) {
    throw new Error(access.reason);
  }
  
  // Proceed with action
}
```

---

## Testing Checklist

### Payment Flow
- [ ] Free user can view pricing
- [ ] User can start checkout
- [ ] Payment succeeds → subscription activated
- [ ] Payment fails → user notified
- [ ] Webhook updates database correctly

### Access Control
- [ ] Free user blocked from paid features
- [ ] Pro user has access to pro features
- [ ] Usage limits enforced correctly
- [ ] Trial users have full access
- [ ] Expired trial blocks access

### Usage Tracking
- [ ] Usage increments correctly
- [ ] Limits enforced at correct thresholds
- [ ] Monthly reset works
- [ ] Usage stats display correctly

---

## Deployment Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Stripe switched to live mode
- [ ] Production webhooks configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Email service configured
- [ ] Monitoring set up

### Post-Launch
- [ ] Monitor error rates
- [ ] Track conversion metrics
- [ ] Monitor payment success rates
- [ ] Check webhook delivery
- [ ] Review usage patterns

---

## Support Resources

### Stripe
- [Stripe Docs](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

### NextAuth
- [NextAuth Docs](https://next-auth.js.org)
- [Session Management](https://next-auth.js.org/getting-started/client#usesession)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## Quick Commands

```bash
# Database
pnpm db:push                    # Push schema changes
pnpm prisma generate            # Generate Prisma client
pnpm prisma db seed             # Seed initial data
pnpm prisma studio              # Open Prisma Studio

# Stripe CLI (for testing webhooks)
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed

# Development
pnpm dev                        # Start dev server
pnpm type                       # Type check
pnpm lint                       # Lint code
```

---

## Important Notes

1. **Always check subscription status** before allowing access to paid features
2. **Track all usage** to enforce limits accurately
3. **Handle webhook failures gracefully** - implement retry logic
4. **Test in Stripe test mode** before going live
5. **Update NextAuth session** after subscription changes
6. **Cache subscription data** to reduce database queries
7. **Implement rate limiting** on API endpoints
8. **Log all payment events** for debugging
9. **Handle edge cases** like expired trials, failed payments
10. **Keep UX smooth** - show loading states, clear error messages

---

**Last Updated:** [Date]  
**Version:** 1.0

