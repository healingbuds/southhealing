

# Plan: Resolve Dr. Green API Permissions and Client Visibility Issues

## Problem Summary

The user "kayliegh.sm@gmail.com" is reportedly a verified Dr. Green customer but:
1. Does NOT appear in the local Healing Buds database
2. Email confirmation was never sent
3. Status was never updated
4. Not showing in the clients list

**Root Cause:** The Dr. Green API credentials lack permissions for `/dapp/*` endpoints (401 Unauthorized on all protected routes).

---

## Technical Investigation Findings

### Database Audit Results

| Table | Records Found | Kayleigh Present? |
|-------|---------------|-------------------|
| `profiles` | 6 test users | No |
| `drgreen_clients` | 6 records (5 test + 1 real) | No |
| `kyc_journey_logs` | 7 entries (Scott only) | No |

### Dr. Green API Status

| Endpoint Type | Example | Status |
|---------------|---------|--------|
| Public (strains) | `/dapp/strains?country=PT` | 200 OK |
| Protected (clients) | `/dapp/clients` | 401 Unauthorized |
| Protected (sales) | `/dapp/sales/summary` | 401 Unauthorized |
| Protected (dashboard) | `/dapp/dashboard/summary` | 401 Unauthorized |

### Email Function Status

| Function | Logs Found | Issue |
|----------|------------|-------|
| `send-onboarding-email` | None | Either not called or failed silently |
| `send-client-email` | None | Either not called or failed silently |

---

## Root Cause Analysis

### Issue 1: API Credentials Lack Admin Permissions

The current `DRGREEN_API_KEY` and `DRGREEN_PRIVATE_KEY` can only access public endpoints. The Dr. Green API requires NFT-backed credentials with specific permissions to access:
- Client management (`/dapp/clients`)
- Order management (`/dapp/orders`)
- Sales data (`/dapp/sales`)
- Dashboard analytics (`/dapp/dashboard`)

**Evidence:** Edge function logs show signature generation succeeds, but API returns 401:
```
[Info] API request: GET /dapp/dashboard/summary
[Info] Response status: 401
```

### Issue 2: Email Delivery Using Test Domain

Both email functions use `onboarding@resend.dev` (Resend's test domain), which:
- Only delivers to the account owner's email
- Cannot send to external recipients in production
- Requires a verified custom domain for real delivery

### Issue 3: User May Not Exist in Healing Buds System

If Kayleigh is a verified Dr. Green customer but never registered on Healing Buds:
- She would exist in Dr. Green's system only
- No local `profiles` or `drgreen_clients` record would exist
- This explains the missing data

---

## Implementation Plan

### Phase 1: Verify Dr. Green API Credentials (Immediate)

**Objective:** Update API keys with credentials that have dApp admin permissions

1. **Obtain new credentials** from Dr. Green admin panel
   - The API key must be associated with an NFT that has admin access
   - Both `DRGREEN_API_KEY` and `DRGREEN_PRIVATE_KEY` need updating

2. **Update secrets in Lovable Cloud**
   - Use the secrets management tool to update:
     - `DRGREEN_API_KEY`
     - `DRGREEN_PRIVATE_KEY`

3. **Redeploy edge functions** to pick up new credentials

4. **Test protected endpoints** via API Comparison Dashboard

### Phase 2: Query Dr. Green for Kayleigh's Record

**Objective:** Find Kayleigh in the Dr. Green system once API access is restored

1. **Call `/dapp/clients` endpoint** with search filter:
   ```json
   {
     "action": "dapp-clients",
     "data": {
       "page": 1,
       "take": 50,
       "search": "kayliegh"
     }
   }
   ```

2. **Check client details** if found:
   - Get `clientId`
   - Check `isKYCVerified` status
   - Check `adminApproval` status

3. **Import to local database** if she exists on Dr. Green but not locally

### Phase 3: Fix Email Delivery

**Objective:** Ensure transactional emails reach recipients

1. **Option A: Verify custom domain in Resend**
   - Add DNS records for `healingbuds.com` or regional domains
   - Update `from` address to `noreply@healingbuds.com`

2. **Option B: Use Resend's onboarding domain for testing**
   - Currently configured but limited to account owner

3. **Add email delivery logging** to track failures

### Phase 4: Create Admin Client Import Tool

**Objective:** Allow admins to manually link Dr. Green clients to local accounts

1. **Create sync endpoint** in `drgreen-proxy`:
   - Fetch client from Dr. Green API by email
   - Create/update local `drgreen_clients` record
   - Match with existing Supabase auth user if present

2. **Add to Admin dashboard**:
   - "Import Client by Email" button
   - Shows Dr. Green data before import
   - Creates local record with correct status

### Phase 5: Improve Registration Error Handling

**Objective:** Prevent silent failures during registration

1. **Enhanced error logging** in `ClientOnboarding.tsx`:
   - Log all API responses (success and failure)
   - Track email delivery status

2. **User feedback on API failures**:
   - Show clear message when Dr. Green API is unavailable
   - Offer retry option with detailed status

3. **Admin notification system**:
   - Alert admins when registration fails with 401
   - Queue failed registrations for manual review

---

## Files to Modify

| File | Changes |
|------|---------|
| Supabase Secrets | Update `DRGREEN_API_KEY`, `DRGREEN_PRIVATE_KEY` |
| `supabase/functions/send-client-email/index.ts` | Update `from` domain after Resend verification |
| `supabase/functions/drgreen-proxy/index.ts` | Add `sync-client-by-email` action |
| `src/components/admin/AdminEmailTrigger.tsx` | Add "Import from Dr. Green" functionality |
| `src/pages/AdminDashboard.tsx` | Add client import section |
| `src/components/shop/ClientOnboarding.tsx` | Improve error handling and logging |

---

## Immediate Action Required

To proceed with finding Kayleigh and resolving the API permissions issue:

**You need to provide updated Dr. Green API credentials that have dApp admin permissions.** The current credentials only have public access.

Contact your Dr. Green account administrator to obtain:
1. An API key associated with an NFT that has admin privileges
2. The matching private key for signature generation

Once provided, I can update the secrets and verify the integration is working.

---

## Summary

| Issue | Status | Resolution |
|-------|--------|------------|
| Kayleigh not in local DB | Confirmed | Need API access to query Dr. Green |
| Email not sent | Likely | Using test domain, needs verification |
| API 401 errors | Confirmed | Need credentials with admin permissions |
| Status not updated | Consequence | Registration never completed due to API failure |

