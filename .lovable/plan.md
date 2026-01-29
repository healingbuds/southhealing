

# Plan: Fix Dr. Green API Signing for Admin Endpoints

## Problem Summary

Several admin endpoints are returning **401 Unauthorized** because they use the wrong signature method. The Dr. Green API expects GET requests with query parameters to sign the **query string**, not an empty body.

## Current Behavior vs Expected

| Endpoint | Current Method | Expected Method | Status |
|----------|----------------|-----------------|--------|
| `dapp-clients` | `drGreenRequest()` (body sign) | `drGreenRequestQuery()` (query sign) | 401 |
| `dashboard-summary` | `drGreenRequest()` (body sign) | `drGreenRequestQuery()` (query sign) | 401 |
| `get-sales` | `drGreenRequestQuery()` | Already correct | 200 |
| `get-clients-summary` | `drGreenRequestBody()` (no params) | Already correct | 200 |

## Implementation Steps

### Step 1: Fix `dapp-clients` Action

Update line ~1847 to use query string signing:

```typescript
case "dapp-clients": {
  const { page, take, orderBy, search, searchBy, status, kyc, adminApproval } = body || {};
  
  if (!validatePagination(page, take)) {
    throw new Error("Invalid pagination parameters");
  }
  
  // Build query params object for proper signing
  const queryParams: Record<string, string | number> = {
    orderBy: orderBy || 'desc',
    take: take || 10,
    page: page || 1,
  };
  if (search) queryParams.search = String(search).slice(0, 100);
  if (searchBy) queryParams.searchBy = searchBy;
  if (status) queryParams.status = status;
  if (kyc) queryParams.kyc = String(kyc);
  if (adminApproval) queryParams.adminApproval = adminApproval;
  
  // Use query string signing for GET with params
  response = await drGreenRequestQuery("/dapp/clients", queryParams);
  break;
}
```

### Step 2: Fix `dashboard-summary` Action

Update line ~1815 to use query string signing:

```typescript
case "dashboard-summary": {
  // Use query signing with empty params for GET endpoint
  response = await drGreenRequestQuery("/dapp/dashboard/summary", {});
  break;
}
```

### Step 3: Fix Other Similar Endpoints

Review and fix these actions if they have the same issue:
- `sales-summary` (line ~1830)
- `dapp-orders` (line ~1867)
- `dapp-carts` (line ~1899)
- `dapp-nfts` (line ~1918)
- `dapp-strains` (line ~1935)

### Step 4: Redeploy and Test

1. Deploy the updated `drgreen-proxy` edge function
2. Test `dapp-clients` → Should return 200 with client list
3. Test `dashboard-summary` → Should return 200 with metrics
4. Verify Admin Dashboard displays live data

## Expected Outcome

After this fix:
- All 6 clients will be visible via the Admin Dashboard
- Dashboard "Live" stats will populate correctly
- Client management features will work as expected

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Update ~6-8 action cases to use `drGreenRequestQuery()` |

