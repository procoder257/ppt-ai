# PayPal Integration Testing Guide

## Current State

✅ **Database**: Clean (0 users, 0 subscriptions)
✅ **PayPal Plans**:
- Monthly: `P-2XN18569N6536591MNE7NNFY` ($19/month)
- Yearly: `P-29Y92668FA528892TNE7NNGA` ($190/year)
✅ **Logging**: Comprehensive logging added to middleware and SubscriptionGate
✅ **Documentation**: Complete routing flow documented in `ROUTING_FLOW.md`

## Prerequisites

Before testing, ensure:
1. Dev server is running: `pnpm dev`
2. PayPal sandbox credentials are in `.env`
3. Google OAuth is configured
4. Database is migrated: `pnpm db:push`

## Complete Test Flow

### Test 1: New User - Full Subscription Flow

**Expected Flow**: Unauthenticated → Sign in → Pricing → PayPal → Success → App

1. **Start with clean database**
   ```bash
   node --env-file=.env --import=tsx/esm scripts/cleanup-all-users.ts
   rm -rf .next
   pnpm dev
   ```

2. **Visit root URL**
   - Go to: `http://localhost:3000`
   - **Expected**: Redirect to `/pricing`
   - **Logs to check**:
     ```
     [Middleware] { path: "/", hasSession: false, ... }
     [Middleware] Root → /pricing
     ```

3. **View pricing page (not signed in)**
   - **Expected**: See pricing page with plans
   - **Logs to check**:
     ```
     [SubscriptionGate] Checking subscription... { requireSubscription: false, sessionStatus: "unauthenticated" }
     [SubscriptionGate] No session, showing content without redirect
     ```

4. **Click "Sign in with Google"**
   - **Expected**: Redirect to Google OAuth
   - Complete Google sign-in
   - **Expected**: Redirect back to `/pricing`
   - **Logs to check**:
     ```
     [Middleware] { path: "/auth/signin", hasSession: true, isAuthPage: true }
     [Middleware] Already signed in on auth page → /pricing
     ```

5. **View pricing page (now signed in)**
   - **Expected**: Still see pricing page (no subscription yet)
   - **Logs to check**:
     ```
     [SubscriptionGate] Checking subscription... { requireSubscription: false, sessionStatus: "authenticated", userId: "cm..." }
     [SubscriptionGate] Subscription check result: { hasActiveSubscription: false }
     [SubscriptionGate] Showing pricing page (no subscription)
     ```

6. **Click "Subscribe" button (Pro Monthly)**
   - **Expected**: Redirect to PayPal sandbox approval page
   - **URL should contain**: `paypal.com/checkoutnow`
   - **Logs to check**: API logs showing PayPal subscription creation

7. **Complete payment on PayPal**
   - Use PayPal sandbox buyer account
   - Click "Approve" or "Subscribe"
   - **Expected**: Redirect to `http://localhost:3000/pricing/success?subscription_id=...&ba_token=...&token=...`
   - **Logs to check**:
     ```
     Success page loaded
     Search params: { subscription_id: "I-...", ba_token: "BA-...", token: "EC-...", all: [...] }
     ```

8. **Success page activates subscription**
   - **Expected**:
     - Loading message appears
     - API call to `/api/paypal/subscription/activate`
     - Success message: "Subscription Activated!"
     - "Go to Dashboard" button appears
   - **Logs to check**: API logs showing subscription activation

9. **Click "Go to Dashboard"**
   - **Expected**: Redirect to `/dashboard`
   - **Logs to check**:
     ```
     [Middleware] { path: "/dashboard", hasSession: true, ... }
     [Middleware] Allowing request to continue
     [SubscriptionGate] Checking subscription... { requireSubscription: true, ... }
     [SubscriptionGate] Subscription check result: { hasActiveSubscription: true }
     [SubscriptionGate] ✅ Has subscription, showing protected content
     ```

✅ **Test 1 Success Criteria**: User successfully subscribed and can access protected routes

---

### Test 2: Existing User With Active Subscription

**Expected Flow**: Sign in → Auto-redirect to app (bypass pricing)

1. **Ensure user from Test 1 still has active subscription**
   ```bash
   node --env-file=.env --import=tsx/esm scripts/check-database-state.ts
   ```

2. **Sign out** (if still signed in)

3. **Visit root URL**
   - Go to: `http://localhost:3000`
   - **Expected**: Redirect to `/pricing`

4. **Sign in with Google** (same account from Test 1)
   - **Expected**: Redirect to `/pricing`

5. **Pricing page checks subscription**
   - **Expected**: Automatic redirect to `/presentation`
   - **Logs to check**:
     ```
     [SubscriptionGate] Checking subscription... { requireSubscription: false, ... }
     [SubscriptionGate] Subscription check result: { hasActiveSubscription: true }
     [SubscriptionGate] ✅ Has subscription, redirecting to /presentation
     ```

6. **Verify access to protected route**
   - **Expected**: Successfully viewing `/presentation`
   - **Logs to check**:
     ```
     [SubscriptionGate] ✅ Has subscription, showing protected content
     ```

✅ **Test 2 Success Criteria**: Subscribed users bypass pricing page and go directly to app

---

### Test 3: User Cancels Payment

**Expected Flow**: Start subscription → Cancel on PayPal → Return to pricing

1. **Sign in with a different Google account** (or clean database)

2. **From pricing page, click "Subscribe"**

3. **On PayPal approval page, click "Cancel"**
   - **Expected**: Redirect to `http://localhost:3000/pricing/cancel`
   - Should see: "Subscription Cancelled" message

4. **Click "Back to Pricing"**
   - **Expected**: Return to `/pricing`
   - Can try subscribing again

✅ **Test 3 Success Criteria**: Cancel flow works without errors

---

### Test 4: Protected Route Access Without Subscription

**Expected Flow**: Try accessing app → Redirect to pricing

1. **Sign in with account that has NO subscription**

2. **Try to access protected route directly**
   - Go to: `http://localhost:3000/presentation`
   - **Expected**: Redirect to `/pricing`
   - **Logs to check**:
     ```
     [Middleware] { path: "/presentation", hasSession: true, ... }
     [Middleware] Allowing request to continue
     [SubscriptionGate] Checking subscription... { requireSubscription: true, ... }
     [SubscriptionGate] Subscription check result: { hasActiveSubscription: false }
     [SubscriptionGate] ❌ No subscription required, redirecting to /pricing
     ```

✅ **Test 4 Success Criteria**: Users without subscription cannot access protected routes

---

### Test 5: Unauthenticated Access to Protected Routes

**Expected Flow**: Try accessing app → Redirect to sign in

1. **Sign out completely**

2. **Try to access protected route**
   - Go to: `http://localhost:3000/presentation`
   - **Expected**: Redirect to `/auth/signin?callbackUrl=...`
   - **Logs to check**:
     ```
     [Middleware] { path: "/presentation", hasSession: false, ... }
     [Middleware] No session on protected route → /auth/signin
     ```

3. **Complete sign-in**
   - **Expected**:
     - If has subscription: Redirect to `/presentation`
     - If no subscription: Redirect to `/pricing`

✅ **Test 5 Success Criteria**: Unauthenticated users cannot access any protected routes

---

## Quick Debug Steps

### Issue: 404 Error After PayPal Redirect

1. **Restart dev server with clean cache**
   ```bash
   rm -rf .next
   pnpm dev
   ```

2. **Check the actual redirect URL**
   - When PayPal redirects back, check browser URL bar
   - Should be: `http://localhost:3000/pricing/success?...`

3. **Verify files exist**
   ```bash
   ls -la src/app/pricing/success/page.tsx
   ls -la src/app/pricing/layout.tsx
   ```

4. **Check middleware isn't blocking**
   - Pricing routes should be allowed
   - Check middleware logs

### Issue: Session Not Found

1. **Verify still signed in**
   - Check browser console for auth errors
   - Try signing out and back in

2. **Check NextAuth configuration**
   - Verify `NEXTAUTH_URL` in `.env`
   - Verify `NEXTAUTH_SECRET` is set

### Issue: PayPal Returns Error

1. **Check terminal logs**
   - Look for API error messages
   - Verify PayPal response details

2. **Verify PayPal credentials**
   ```bash
   grep PAYPAL .env
   ```

3. **Check sandbox account**
   - Login to PayPal sandbox dashboard
   - Verify buyer account has funds
   - Check plan IDs are correct

### Issue: Infinite Redirect Loop

1. **Check SubscriptionGate props**
   - Pricing page: `requireSubscription={false}`
   - Protected routes: `requireSubscription={true}`

2. **Clear browser cache and cookies**

3. **Check middleware logic**
   - Review console logs for redirect patterns

## Logs to Monitor

### Browser Console
Open browser DevTools (F12) → Console tab

**Expected logs during normal flow**:
```
[SubscriptionGate] Checking subscription...
[SubscriptionGate] Subscription check result: {...}
[SubscriptionGate] ✅ Has subscription, redirecting to /presentation
```

### Terminal (Dev Server)
**Expected logs during normal flow**:
```
[Middleware] { path: "/pricing", hasSession: true, isPricingPage: true, ... }
[Middleware] Allowing request to continue

Success page loaded
Search params: { subscription_id: "I-...", ... }

GET /api/subscription/check 200
POST /api/paypal/subscription/activate 200
```

## Manual Route Testing

Test these URLs directly in browser while signed in:

| URL | Expected Behavior (No Subscription) | Expected Behavior (With Subscription) |
|-----|-------------------------------------|---------------------------------------|
| `/` | Redirect to `/pricing` | Redirect to `/pricing`, then `/presentation` |
| `/pricing` | Show pricing page | Redirect to `/presentation` |
| `/pricing/success` | Show error (no params) | Show error (no params) |
| `/pricing/cancel` | Show cancel message | Show cancel message |
| `/presentation` | Redirect to `/pricing` | Show presentation page |
| `/dashboard` | Redirect to `/pricing` | Show dashboard |
| `/auth/signin` | Show sign in page | Redirect to `/pricing` |

## Database Verification

Check database state at any time:
```bash
node --env-file=.env --import=tsx/esm scripts/check-database-state.ts
```

**Expected output after successful subscription**:
```
Users: 1
Subscriptions: 1
  - Status: ACTIVE
  - PayPal Subscription ID: I-...
  - Plan: Pro
  - Billing Cycle: MONTHLY
  - Next Billing Date: ...
```

## Clean Database for New Tests

```bash
# Remove all users and subscriptions
node --env-file=.env --import=tsx/esm scripts/cleanup-all-users.ts

# Or just remove subscriptions
node --env-file=.env --import=tsx/esm scripts/cleanup-subscriptions.ts
```

## PayPal Sandbox Testing Tips

1. **Create test buyer account**: https://developer.paypal.com/dashboard/accounts
2. **Fund test account**: Edit account → Add funds
3. **View subscription details**: Business account → Subscriptions
4. **Check webhook events**: Developer Dashboard → Webhooks

## Success Indicators

✅ All redirects work smoothly without 404 errors
✅ Subscriptions are created and activated correctly
✅ Protected routes are inaccessible without subscription
✅ Pricing page redirects subscribed users to app
✅ Logs show correct flow at each step
✅ Database reflects correct subscription status
✅ Cancel flow returns user to pricing page

## Troubleshooting Commands

```bash
# Restart dev server
rm -rf .next && pnpm dev

# Check database state
node --env-file=.env --import=tsx/esm scripts/check-database-state.ts

# Clean all data
node --env-file=.env --import=tsx/esm scripts/cleanup-all-users.ts

# Test PayPal connection
node --env-file=.env --import=tsx/esm scripts/test-paypal-connection.ts

# Check plan configuration
node --env-file=.env --import=tsx/esm scripts/check-plans.ts
```
