# Complete Routing Flow Documentation

## Overview
This document describes the complete routing flow for the PPT AI application with PayPal subscription integration.

## Authentication & Subscription Flow Layers

### Layer 1: Middleware (Edge Runtime)
**File**: `src/middleware.ts`

**Purpose**: Handles authentication checks at the edge (cannot access database)

**Logic**:
1. **Root path (`/`)** → Always redirect to `/pricing`
   - SubscriptionGate on pricing page will handle further routing

2. **Auth pages (`/auth/*`)**
   - If user is already signed in → Redirect to `/pricing`
   - If user is not signed in → Allow access

3. **Protected routes** (not auth, not pricing, not API)
   - If user is not signed in → Redirect to `/auth/signin?callbackUrl=...`
   - If user is signed in → Allow through to Layer 2

4. **Pricing pages (`/pricing/*`)** → Always allow access
   - SubscriptionGate will handle subscription checks

5. **API routes (`/api/*`)** → Always allow access

**Logging**: All requests are logged with path, session status, and routing decision

### Layer 2: SubscriptionGate (Client-side)
**File**: `src/components/subscription/SubscriptionGate.tsx`

**Purpose**: Handles subscription verification (can access database via API)

**Props**:
- `requireSubscription: boolean` - Whether the wrapped content requires an active subscription

**Logic**:

#### When `requireSubscription = true` (protecting app content):
- **No session** → Show content (middleware will redirect if needed)
- **Has session + No subscription** → Redirect to `/pricing`
- **Has session + Has subscription** → Show protected content

#### When `requireSubscription = false` (on pricing page):
- **No session** → Show pricing page
- **Has session + No subscription** → Show pricing page
- **Has session + Has subscription** → Redirect to `/presentation`

**API Call**: Fetches `/api/subscription/check` to verify subscription status

**Logging**: All subscription checks and redirect decisions are logged with emoji indicators

## Complete User Journey Flows

### Flow 1: New User Without Account
```
1. User visits http://localhost:3000
   → Middleware: / → /pricing

2. User lands on /pricing
   → SubscriptionGate (requireSubscription=false): No session → Show pricing

3. User clicks "Sign in with Google"
   → Redirects to /auth/signin

4. After Google OAuth
   → Middleware: /auth/signin (authenticated) → /pricing

5. User lands on /pricing (now authenticated)
   → SubscriptionGate: Has session + No subscription → Show pricing

6. User clicks "Subscribe" button
   → API: /api/paypal/checkout → Creates subscription
   → Redirects to PayPal approval page

7. User completes payment on PayPal
   → PayPal redirects to /pricing/success?subscription_id=...&token=...

8. Success page loads
   → Calls /api/paypal/subscription/activate
   → Activates subscription in database
   → Shows success message
   → User clicks "Go to Dashboard"

9. User redirected to /dashboard
   → Middleware: Authenticated → Allow
   → Layout has SubscriptionGate (requireSubscription=true)
   → SubscriptionGate: Has subscription → Show dashboard
```

### Flow 2: Existing User With Subscription
```
1. User visits http://localhost:3000
   → Middleware: / → /pricing

2. User lands on /pricing
   → SubscriptionGate: No session → Show pricing

3. User signs in with Google
   → After OAuth → /pricing

4. User lands on /pricing (authenticated)
   → SubscriptionGate: Has session + Has subscription → Redirect to /presentation

5. User lands on /presentation
   → Middleware: Authenticated → Allow
   → Layout has SubscriptionGate (requireSubscription=true)
   → SubscriptionGate: Has subscription → Show presentation page
```

### Flow 3: User Cancels Payment
```
1-6. Same as Flow 1

7. User cancels payment on PayPal
   → PayPal redirects to /pricing/cancel

8. Cancel page shows
   → "Your subscription setup was cancelled. No charges were made."
   → User clicks "Back to Pricing"

9. User redirected to /pricing
   → Can try again or sign out
```

### Flow 4: Authenticated User Tries to Access Protected Route Directly
```
1. User visits http://localhost:3000/presentation (while authenticated but no subscription)
   → Middleware: Authenticated → Allow to Layer 2

2. /presentation layout loads
   → Layout has SubscriptionGate (requireSubscription=true)
   → SubscriptionGate: Has session + No subscription → Redirect to /pricing

3. User lands on /pricing
   → Must subscribe to access /presentation
```

### Flow 5: Unauthenticated User Tries to Access Protected Route
```
1. User visits http://localhost:3000/presentation (not signed in)
   → Middleware: Not authenticated + Protected route → Redirect to /auth/signin?callbackUrl=.../presentation

2. User signs in
   → After OAuth → Redirect to /presentation

3. /presentation loads
   → Layout has SubscriptionGate (requireSubscription=true)
   → SubscriptionGate checks subscription
   → If no subscription → Redirect to /pricing
   → If has subscription → Show presentation
```

## Route Protection Summary

### Public Routes (No Auth Required)
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page (if exists)
- `/pricing` - Pricing page (public to allow viewing plans)
- `/pricing/success` - PayPal return page
- `/pricing/cancel` - PayPal cancel page
- `/api/*` - API routes (handle their own auth)

### Protected Routes (Auth Required, No Subscription Required)
- None currently - all authenticated routes require subscription

### Protected Routes (Auth + Subscription Required)
- `/presentation` - Main app page
- `/dashboard` - User dashboard
- Any other app routes

## Key Components

### SubscriptionGate Placement

1. **Pricing Page** (`src/app/pricing/page.tsx`):
   ```tsx
   <SubscriptionGate requireSubscription={false}>
     <PricingPageContent />
   </SubscriptionGate>
   ```
   - Redirects subscribed users away from pricing

2. **Presentation Layout** (`src/app/presentation/layout.tsx`):
   ```tsx
   <SubscriptionGate requireSubscription={true}>
     {children}
   </SubscriptionGate>
   ```
   - Protects all presentation routes

## API Routes

### Subscription Check
**Endpoint**: `GET /api/subscription/check`
- Returns: `{ hasActiveSubscription: boolean, subscription?: {...} }`
- Used by: SubscriptionGate to verify subscription status

### PayPal Checkout
**Endpoint**: `POST /api/paypal/checkout`
- Body: `{ planId: string, billingCycle: "MONTHLY" | "YEARLY" }`
- Returns: `{ approvalUrl: string }` - Redirect user here

### PayPal Activate
**Endpoint**: `POST /api/paypal/subscription/activate`
- Body: `{ subscriptionId: string }`
- Returns: Success/error status
- Called by: Success page after PayPal approval

### PayPal Webhook
**Endpoint**: `POST /api/paypal/webhook`
- Handles: Subscription lifecycle events from PayPal
- Events: BILLING.SUBSCRIPTION.*, PAYMENT.SALE.*, PAYMENT.CAPTURE.*

## PayPal Configuration

### Plans Created
- **Monthly Plan**: `P-2XN18569N6536591MNE7NNFY` - $19/month
- **Yearly Plan**: `P-29Y92668FA528892TNE7NNGA` - $190/year
- **Product ID**: `PROD-3N375870R31657426`

### Return URLs
- **Success**: `http://localhost:3000/pricing/success`
  - PayPal appends: `?subscription_id=...&ba_token=...&token=...`
- **Cancel**: `http://localhost:3000/pricing/cancel`

## Debugging

### Console Logs to Check

#### Middleware Logs
```
[Middleware] {
  path: "/presentation",
  hasSession: true,
  isAuthPage: false,
  isPricingPage: false,
  isApiRoute: false
}
[Middleware] Allowing request to continue
```

#### SubscriptionGate Logs
```
[SubscriptionGate] Checking subscription... {
  requireSubscription: true,
  sessionStatus: "authenticated",
  userId: "cm..."
}
[SubscriptionGate] Subscription check result: {
  hasActiveSubscription: true,
  subscription: { ... }
}
[SubscriptionGate] ✅ Has subscription, showing protected content
```

#### Success Page Logs
```
Success page loaded
Search params: {
  subscription_id: "I-...",
  ba_token: "BA-...",
  token: "EC-...",
  all: [...]
}
```

## Common Issues & Solutions

### Issue: 404 on /pricing/success
- **Cause**: Dev server cache not updated
- **Solution**: `rm -rf .next && pnpm dev`

### Issue: User bypasses payment
- **Cause**: SubscriptionGate not protecting routes
- **Solution**: Ensure layout.tsx has SubscriptionGate wrapper

### Issue: Infinite redirect loop
- **Cause**: SubscriptionGate redirecting to a route that also has SubscriptionGate
- **Solution**: Verify requireSubscription prop is set correctly

### Issue: Success page shows error
- **Cause**: Session lost or subscription_id not received
- **Solution**: Check console logs for PayPal parameters, verify user is still signed in

## Testing Checklist

- [ ] Visit root `/` → Should redirect to `/pricing`
- [ ] Try accessing `/presentation` without auth → Should redirect to sign in
- [ ] Sign in → Should redirect to `/pricing` (if no subscription)
- [ ] Click subscribe → Should redirect to PayPal
- [ ] Complete payment → Should redirect to `/pricing/success`
- [ ] Success page → Should activate subscription
- [ ] Click "Go to Dashboard" → Should access dashboard successfully
- [ ] Visit `/pricing` with active subscription → Should redirect to `/presentation`
- [ ] Sign out and visit `/presentation` → Should redirect to sign in
- [ ] Cancel payment on PayPal → Should redirect to `/pricing/cancel`
