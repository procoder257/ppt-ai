# Commercialization Plan: PPT AI to Full-Fledged SaaS Platform

## Overview
This document outlines a comprehensive step-by-step plan to transform the PPT AI application into a commercial SaaS product similar to Gamma and PopAI, with payment gateway integration, subscription management, and access control.

---

## Phase 1: Database Schema & Models (Foundation)

### Step 1.1: Extend Prisma Schema for Subscriptions
**Status:** ⬜ Pending  
**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 hours

**Tasks:**
1. Add subscription-related models to `prisma/schema.prisma`:
   - `SubscriptionPlan` model (Free, Pro, Enterprise tiers)
   - `Subscription` model (user subscriptions with status, billing cycle)
   - `Payment` model (payment history and transactions)
   - `Usage` model (track API calls, presentations created, etc.)
   - `FeatureLimit` model (define limits per plan)

2. Add fields to existing `User` model:
   - `subscriptionId` (optional foreign key)
   - `stripeCustomerId` (for Stripe integration)
   - `trialEndsAt` (optional DateTime for trial periods)
   - `subscriptionStatus` enum (ACTIVE, TRIAL, EXPIRED, CANCELLED)

3. Run migration: `pnpm db:push`

**Deliverables:**
- Updated `schema.prisma` with all subscription models
- Migration applied successfully
- TypeScript types generated

---

### Step 1.2: Create Subscription Service Layer
**Status:** ⬜ Pending  
**Priority:** 🔴 Critical  
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create `src/server/subscription/` directory structure:
   - `types.ts` - Subscription types and enums
   - `plans.ts` - Define subscription plans (Free, Pro, Enterprise)
   - `limits.ts` - Feature limits per plan
   - `service.ts` - Core subscription logic

2. Implement functions:
   - `getUserSubscription(userId: string)`
   - `getUserPlan(userId: string)`
   - `checkFeatureAccess(userId: string,` feature: string)`
   - `incrementUsage(userId: string, feature: string)`
   - `checkUsageLimit(userId: string, feature: string)`

**Deliverables:**
- Complete subscription service layer
- Type-safe subscription utilities
- Usage tracking functions

---

## Phase 2: Payment Gateway Integration (PayPal)

### Step 2.1: Setup Payment Provider
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 1 hour (setup) + 4-5 hours (integration)

**Tasks:**
1. Create PayPal account and get API keys
2. Install PayPal packages:
   ```bash
   pnpm add @paypal/checkout-server-sdk
   ```
3. Add PayPal environment variables to `src/env.js`:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_WEBHOOK_SECRET`

4. Create `src/server/paypal/` directory:
   - `client.ts` - PayPal client initialization
   - `products.ts` - Define PayPal products and plans
   - `webhooks.ts` - Handle PayPal webhook events

**Deliverables:**
- PayPal account configured
- Environment variables added
- PayPal client initialized

---

### Step 2.2: Create PayPal Products and Plans
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 2-3 hours

**Tasks:**
1. Create PayPal products and plans in PayPal Dashboard or via API:
   - Free Plan (no cost)
   - Pro Plan (monthly/annual)
   - Enterprise Plan (custom pricing)

2. Create `src/server/paypal/products.ts`:
   - Define product IDs and plan IDs
   - Map PayPal products/plans to internal subscription plans

3. Store product/plan IDs in database or environment variables

**Deliverables:**
- PayPal products and plans created
- Plan IDs documented
- Mapping between PayPal and internal plans

---

### Step 2.3: Implement Checkout Flow
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours

**Tasks:**
1. Create API route: `src/app/api/paypal/checkout/route.ts`
   - Create PayPal Order
   - Link to user account
   - Handle success/cancel redirects

2. Create checkout page: `src/app/pricing/page.tsx`
   - Display pricing tiers
   - "Upgrade" buttons for each plan
   - Redirect to PayPal Checkout

3. Create success page: `src/app/pricing/success/page.tsx`
   - Confirm subscription activation
   - Redirect to dashboard

4. Create cancel page: `src/app/pricing/cancel/page.tsx`
   - Handle cancelled payments

**Deliverables:**
- Working checkout flow
- Pricing page with all tiers
- Success/cancel handling

---

### Step 2.4: Implement PayPal Webhooks
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create webhook endpoint: `src/app/api/paypal/webhook/route.ts`
   - Verify webhook signatures
   - Handle events:
     - `CHECKOUT.ORDER.APPROVED` - Activate subscription
     - `BILLING.SUBSCRIPTION.UPDATED` - Update subscription
     - `BILLING.SUBSCRIPTION.CANCELLED` - Cancel subscription
     - `PAYMENT.SALE.COMPLETED` - Record payment
     - `PAYMENT.SALE.DENIED` - Handle failed payments

2. Update database on webhook events:
   - Create/update Subscription record
   - Update User subscription status
   - Record Payment transactions

3. Test webhooks using PayPal Sandbox and ngrok

**Deliverables:**
- Webhook endpoint handling all events
- Database updates on payment events
- Tested with PayPal Sandbox

---

## Phase 3: Access Control & Feature Gating

### Step 3.1: Update Middleware for Subscription Checks
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 2-3 hours

**Tasks:**
1. Update `src/middleware.ts`:
   - Add subscription status check
   - Redirect non-paying users to pricing page
   - Allow access to pricing/auth pages

2. Create helper function: `src/lib/subscription/check-access.ts`
   - Check if user has active subscription
   - Check if user is on trial
   - Return access status

**Deliverables:**
- Middleware protecting paid features
- Access check utilities

---

### Step 3.2: Create Access Control Hooks & Components
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create React hook: `src/hooks/useSubscription.ts`
   - Fetch user subscription status
   - Check feature access
   - Provide loading states

2. Create access control components:
   - `src/components/subscription/Paywall.tsx` - Paywall overlay
   - `src/components/subscription/UpgradePrompt.tsx` - Upgrade CTA
   - `src/components/subscription/FeatureGate.tsx` - Conditional feature rendering

3. Create server action: `src/app/_actions/subscription/checkAccess.ts`
   - Server-side access checks
   - Usage limit validation

**Deliverables:**
- React hooks for subscription checks
- Reusable paywall components
- Server-side access validation

---

### Step 3.3: Gate Presentation Generation Features
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours

**Tasks:**
1. Update `src/app/api/presentation/generate/route.ts`:
   - Check subscription before generation
   - Check usage limits (presentations per month)
   - Return 402 Payment Required if no access

2. Update `src/app/api/presentation/outline/route.ts`:
   - Add subscription check
   - Limit outline generation for free tier

3. Update presentation creation actions:
   - `src/app/_actions/presentation/presentationActions.ts`
   - Check limits before creating
   - Increment usage counters

4. Add paywall to dashboard:
   - `src/components/presentation/dashboard/PresentationDashboard.tsx`
   - Show upgrade prompt for free users
   - Limit number of presentations visible

**Deliverables:**
- All API routes protected
- Usage limits enforced
- Paywall UI implemented

---

## Phase 4: Subscription Management UI

### Step 4.1: Create Pricing Page
**Status:** ✅ Completed
**Priority:** 🔴 High
**Estimated Time:** 4-5 hours

**Tasks:**
1. Create `src/app/pricing/page.tsx`:
   - Display all subscription tiers
   - Feature comparison table
   - Pricing (monthly/annual toggle)
   - "Get Started" / "Upgrade" buttons

2. Create pricing components:
   - `src/components/pricing/PricingCard.tsx`
   - `src/components/pricing/FeatureList.tsx`
   - `src/components/pricing/PlanComparison.tsx`

3. Design considerations:
   - Highlight recommended plan
   - Show savings for annual plans
   - Mobile-responsive layout

**Deliverables:**
- Beautiful pricing page
- Feature comparison
- Mobile-responsive design

---

### Step 4.2: Create Subscription Management Dashboard
**Status:** ✅ Completed
**Priority:** 🔴 High
**Estimated Time:** 5-6 hours

**Tasks:**
1. Create `src/app/settings/subscription/page.tsx`:
   - Current plan display
   - Usage statistics (presentations created, API calls)
   - Billing history
   - Cancel/upgrade/downgrade options

2. Create components:
   - `src/components/subscription/SubscriptionCard.tsx`
   - `src/components/subscription/UsageStats.tsx`
   - `src/components/subscription/BillingHistory.tsx`
   - `src/components/subscription/CancelSubscription.tsx`

3. Implement actions:
   - `src/app/_actions/subscription/manageSubscription.ts`
   - Cancel subscription
   - Upgrade/downgrade subscription
   - Update payment method

**Deliverables:**
- Complete subscription management UI
- Usage tracking display
- Billing history

---

### Step 4.3: Implement Customer Portal
**Status:** ✅ Completed
**Priority:** 🟡 Medium
**Estimated Time:** 2-3 hours

**Tasks:**
1. Create API route: `src/app/api/paypal/portal/route.ts`
   - Create PayPal Customer Portal session
   - Allow users to manage billing

2. Add "Manage Billing" button in settings
   - Redirects to PayPal Customer Portal
   - Users can update payment methods, view invoices

**Deliverables:**
- PayPal Customer Portal integration
- Easy billing management

---

## Phase 5: Usage Tracking & Limits

### Step 5.1: Implement Usage Tracking System
**Status:** ⬜ Pending
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours

**Tasks:**
1. Create usage tracking service: `src/server/usage/tracker.ts`
   - Track presentations created
   - Track API calls (AI generation)
   - Track image generations
   - Track storage usage

2. Create database functions:
   - `recordUsage(userId, feature, amount)`
   - `getUsage(userId, feature, period)`
   - `resetUsage(userId, period)` - for monthly resets

3. Add usage tracking to:
   - Presentation generation
   - Outline generation
   - Image generation
   - File uploads

**Deliverables:**
- Usage tracking system
- Database records for all usage
- Monthly reset logic

---

### Step 5.2: Implement Usage Limits Enforcement
**Status:** ⬜ Pending
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create limit checking service: `src/server/usage/limits.ts`
   - Check if user exceeded limit
   - Return remaining quota
   - Provide upgrade suggestions

2. Update all protected endpoints:
   - Check limits before processing
   - Return 429 Too Many Requests if exceeded
   - Include remaining quota in response headers

3. Add limit warnings in UI:
   - Show usage progress bars
   - Warn when approaching limits
   - Prompt upgrade when limit reached

**Deliverables:**
- Limit enforcement on all features
- Usage warnings in UI
- Upgrade prompts at limits

---

## Phase 6: Trial Period Implementation

### Step 6.1: Add Trial Period Logic
**Status:** ⬜ Pending
**Priority:** 🟡 Medium
**Estimated Time:** 3-4 hours

**Tasks:**
1. Update user creation:
   - Set `trialEndsAt` on new user signup (e.g., 7 days)
   - Grant full access during trial

2. Update access checks:
   - Check if trial is active
   - Allow access if trial hasn't expired
   - Show trial countdown in UI

3. Create trial expiration handling:
   - Email reminder 2 days before expiration
   - Lock access after expiration
   - Prompt to subscribe

**Deliverables:**
- Trial period for new users
- Trial countdown UI
- Expiration handling

---

## Phase 7: Email Notifications

### Step 7.1: Setup Email Service
**Status:** ⬜ Pending
**Priority:** 🟡 Medium
**Estimated Time:** 2-3 hours

**Tasks:**
1. Choose email provider (Resend, SendGrid, or AWS SES)
2. Install email package (e.g., `@react-email/components`, `resend`)
3. Add email API key to environment variables
4. Create email templates:
   - Welcome email
   - Subscription confirmation
   - Payment receipt
   - Trial ending reminder
   - Subscription cancelled

**Deliverables:**
- Email service configured
- Email templates created
- Email sending functions

---

### Step 7.2: Implement Email Notifications
**Status:** ⬜ Pending
**Priority:** 🟡 Medium
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create email service: `src/server/email/service.ts`
2. Send emails on:
   - User signup (welcome + trial info)
   - Subscription activated
   - Payment received
   - Trial ending (2 days before)
   - Subscription cancelled
   - Payment failed

**Deliverables:**
- Automated email notifications
- All key events covered

---

## Phase 8: Admin Dashboard

### Step 8.1: Create Admin Panel
**Status:** ⬜ Pending
**Priority:** 🟢 Low
**Estimated Time:** 6-8 hours

**Tasks:**
1. Create `src/app/admin/` directory
2. Implement admin routes:
   - Dashboard with metrics
   - User management
   - Subscription management
   - Revenue analytics
   - Usage analytics

3. Add admin-only middleware
4. Create admin components:
   - User list with filters
   - Subscription overview
   - Revenue charts
   - Usage statistics

**Deliverables:**
- Admin dashboard
- User management
- Analytics and reporting

---

## Phase 9: Testing & Quality Assurance

### Step 9.1: Payment Flow Testing
**Status:** ⬜ Pending
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours

**Tasks:**
1. Test PayPal sandbox mode:
   - Successful payment flow
   - Failed payment handling
   - Subscription upgrades
   - Subscription cancellations
   - Webhook events

2. Test edge cases:
   - Expired cards
   - Insufficient funds
   - Webhook failures
   - Concurrent subscription changes

**Deliverables:**
- All payment flows tested
- Edge cases handled
- Test documentation

---

### Step 9.2: Access Control Testing
**Status:** ⬜ Pending  
**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 hours

**Tasks:**
1. Test subscription tiers:
   - Free tier limits
   - Pro tier access
   - Enterprise features
   - Trial period access

2. Test usage limits:
   - Limit enforcement
   - Usage tracking accuracy
   - Monthly resets

**Deliverables:**
- All access controls verified
- Limits properly enforced

---

## Phase 10: Documentation & Deployment

### Step 10.1: Update Environment Variables
**Status:** ⬜ Pending  
**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour

**Tasks:**
1. Update `src/env.js` with all new variables:
   - Stripe keys
   - Email service keys
   - Webhook secrets

2. Create `.env.example` file
3. Document all required environment variables

**Deliverables:**
- Complete environment setup
- Documentation for deployment

---

### Step 10.2: Production Deployment Checklist
**Status:** ⬜ Pending  
**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 hours

**Tasks:**
1. Switch Stripe to live mode
2. Configure production webhooks
3. Set up monitoring (Sentry, LogRocket, etc.)
4. Configure error tracking
5. Set up analytics (PostHog, Mixpanel, etc.)
6. Performance optimization
7. Security audit

**Deliverables:**
- Production-ready deployment
- Monitoring in place
- Analytics configured

---

## Implementation Priority Matrix

### Critical Path (Must Have for Launch):
1. ✅ Phase 1: Database Schema
2. ✅ Phase 2: Payment Gateway Integration
3. ✅ Phase 3: Access Control
4. ⬜ Phase 5: Usage Tracking
5. ⬜ Phase 9: Testing

### High Priority (Should Have):
6. ✅ Phase 4: Subscription Management UI
7. ⬜ Phase 6: Trial Period

### Medium Priority (Nice to Have):
8. ⬜ Phase 7: Email Notifications
9. ⬜ Phase 8: Admin Dashboard

---

## Feature Limits by Plan

### Free Tier:
- 3 presentations per month
- Basic themes only
- Standard image generation
- No export to PPTX
- Community support

### Pro Tier ($19/month or $190/year):
- Unlimited presentations
- All themes + custom themes
- Premium image generation
- Export to PPTX
- Priority support
- Advanced AI models

### Enterprise Tier (Custom Pricing):
- Everything in Pro
- Custom branding
- API access
- Dedicated support
- Custom integrations
- SLA guarantees

---

## Technical Stack Additions

### New Dependencies:
```json
{
  "@paypal/checkout-server-sdk": "^1.0.3",
  "resend": "^3.0.0", // or preferred email service
  "@react-email/components": "^0.0.15"
}
```

### New Environment Variables:
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
RESEND_API_KEY=re_... (or equivalent)
```

---

## Estimated Timeline

- **Phase 1-3 (Core):** 2-3 weeks
- **Phase 4-5 (UI & Tracking):** 1-2 weeks
- **Phase 6-7 (Trial & Email):** 1 week
- **Phase 8-10 (Admin & Deploy):** 1-2 weeks

**Total:** 5-8 weeks for complete implementation

---

## Success Metrics to Track

1. **Conversion Rate:** Free → Paid
2. **MRR (Monthly Recurring Revenue)**
3. **Churn Rate**
4. **Average Revenue Per User (ARPU)**
5. **Trial-to-Paid Conversion**
6. **Feature Usage by Tier**
7. **Customer Lifetime Value (LTV)**

---

## Notes for Coding Agents

1. **Always check subscription status** before allowing access to paid features
2. **Track all usage** to enforce limits accurately
3. **Handle webhook failures gracefully** - implement retry logic
4. **Test in PayPal sandbox mode** before going live
5. **Update session** after subscription changes using `update()` from NextAuth
6. **Cache subscription data** to reduce database queries
7. **Implement rate limiting** on API endpoints
8. **Log all payment events** for debugging
9. **Handle edge cases** like expired trials, failed payments, etc.
10. **Keep user experience smooth** - show loading states, clear error messages

---

## Next Steps

1. Review and approve this plan
2. Set up PayPal account
3. Begin with Phase 1 (Database Schema)
4. Follow phases sequentially
5. Test thoroughly before production launch

---

**Last Updated:** [Date]  
**Status:** Planning Phase  
**Owner:** Development Team

