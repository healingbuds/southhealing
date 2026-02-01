
# Plan: Fix Client Details Access for Checkout + Admin Address Updates

## Problem Summary

The checkout flow is failing because:
1. `getClientDetails()` calls `dapp-client-details` which is in `ADMIN_ACTIONS`
2. Regular users (like Kayliegh) get **403 Forbidden** when checkout tries to fetch their shipping address
3. This causes the checkout UI to incorrectly show an empty address form even when the user has a saved address
4. Additionally, `update-shipping-address` is not in any action list, causing permission issues

---

## Root Cause Analysis

| Current State | Problem |
|---------------|---------|
| `dapp-client-details` is in `ADMIN_ACTIONS` | Regular users can't fetch their own client details |
| `update-shipping-address` is not in any action list | Undefined permission behavior |
| `getClientDetails()` hook uses `dapp-client-details` | Checkout can't verify existing shipping address |

---

## Solution Overview

1. **Add `get-my-details`** - New ownership-verified action for users to fetch their own client details
2. **Add `update-shipping-address` to OWNERSHIP_ACTIONS** - Users can update their own address
3. **Add `admin-update-shipping-address` to ADMIN_ACTIONS** - Admins can update any client's address

---

## Technical Changes

### 1. Edge Function Updates (`supabase/functions/drgreen-proxy/index.ts`)

#### Update OWNERSHIP_ACTIONS array (line 95-99):
```typescript
const OWNERSHIP_ACTIONS = [
  'get-client', 'get-cart-legacy', 'get-cart',
  'add-to-cart', 'remove-from-cart', 'empty-cart',
  'place-order', 'get-order', 'get-orders',
  'get-my-details',           // NEW: users fetch own client details
  'update-shipping-address',   // NEW: users update own address
];
```

#### Update ADMIN_ACTIONS array (line 84-92):
```typescript
const ADMIN_ACTIONS = [
  // ... existing actions ...
  'admin-update-shipping-address',  // NEW: admins update any client's address
];
```

#### Add new `get-my-details` handler in switch statement:
```typescript
case "get-my-details": {
  // User fetching their own client details (ownership verified via clientId match)
  const clientId = body.clientId || body.data?.clientId;
  if (!clientId) {
    throw new Error("clientId is required");
  }
  if (!validateClientId(clientId)) {
    throw new Error("Invalid client ID format");
  }
  response = await drGreenRequest(`/dapp/clients/${clientId}`, "GET");
  break;
}
```

#### Add new `admin-update-shipping-address` handler (copy logic from update-shipping-address):
```typescript
case "admin-update-shipping-address": {
  // Admin can update any client's shipping address (no ownership check)
  // Same logic as update-shipping-address
  if (!validateClientId(body.clientId)) {
    throw new Error("Invalid client ID format");
  }
  // ... same shipping validation and API call ...
}
```

---

### 2. Hook Updates (`src/hooks/useDrGreenApi.ts`)

#### Update `getClientDetails` to use ownership-verified action:
```typescript
// Get client details including shipping address (for the logged-in user)
const getClientDetails = async (clientId: string) => {
  return callProxy<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isKYCVerified: boolean;
    adminApproval: string;
    shipping?: {
      address1: string;
      address2?: string;
      landmark?: string;
      city: string;
      state?: string;
      country: string;
      countryCode: string;
      postalCode: string;
    };
  }>('get-my-details', { clientId });  // Changed from 'dapp-client-details'
};
```

#### Add `adminUpdateShippingAddress` method:
```typescript
// Admin: Update any client's shipping address (bypass ownership check)
const adminUpdateShippingAddress = async (clientId: string, shipping: {
  address1: string;
  address2?: string;
  landmark?: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  postalCode: string;
}) => {
  return callProxy<{ success: boolean; message?: string }>('admin-update-shipping-address', { 
    clientId, 
    shipping 
  });
};
```

---

## Action Classification After Changes

| Action | List | Who Can Use | Purpose |
|--------|------|-------------|---------|
| `get-my-details` | OWNERSHIP_ACTIONS | Users (own data only) | Fetch own client details + shipping |
| `update-shipping-address` | OWNERSHIP_ACTIONS | Users (own data only) | Update own shipping address |
| `dapp-client-details` | ADMIN_ACTIONS | Admins only | Fetch any client's details |
| `admin-update-shipping-address` | ADMIN_ACTIONS | Admins only | Update any client's address |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Add actions to OWNERSHIP_ACTIONS and ADMIN_ACTIONS; add two new handlers |
| `src/hooks/useDrGreenApi.ts` | Update `getClientDetails` to use `get-my-details`; add `adminUpdateShippingAddress` |

---

## Testing Plan

After implementation:
1. **Deploy** updated edge function
2. **Login as Kayliegh** (regular user with existing shipping address)
3. **Navigate to checkout** - verify shipping address is auto-detected and displayed
4. **Verify order placement** - "Place Order" button should be active, not blocked
5. **Complete test order** - confirm checkout succeeds without 400 error
6. **Test admin functionality** - login as admin and verify ability to update any client's address via dashboard
