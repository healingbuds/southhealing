
# Fix Checkout Flow: Shipping Address + Order Creation

## Problem Summary

Two issues are preventing a complete checkout flow:

1. **Shipping address not fetching from Dr. Green API** - The `get-my-details` API call returns 401 for personal client IDs (external API permission issue)
2. **Shipping address not included in order creation** - Even when the user enters a shipping address via the form, it is NOT passed to the `createOrder` API call

## Root Cause Analysis

### Issue 1: API 401 Errors
The `getClientDetails` function calls `GET /dapp/clients/:clientId` to fetch existing shipping data, but the external Dr. Green API returns 401 for certain client IDs. This triggers the graceful fallback (showing the shipping form), which is working correctly.

### Issue 2: Shipping Address Not Passed (The Real Bug)
In `Checkout.tsx` (lines 175-197), the `createOrder` fallback call does NOT include the `shippingAddress` state:

```javascript
// Current (broken)
createOrder({
  clientId: clientId,
  items: cart.map(item => ({...})),
  // Missing: shippingAddress!
})
```

The `shippingAddress` state variable exists and is populated when the user submits the `ShippingAddressForm`, but it is never passed to either order creation method.

## Implementation Plan

### Step 1: Pass Shipping Address to Direct Order Creation
**File**: `src/pages/Checkout.tsx`

Update the `createOrder` call (lines 180-188) to include the shipping address:

```javascript
const directOrderResult = await retryOperation(
  () => createOrder({
    clientId: clientId,
    items: cart.map(item => ({
      productId: item.strain_id,
      quantity: item.quantity,
      price: item.unit_price,
    })),
    // NEW: Include shipping address
    shippingAddress: shippingAddress ? {
      street: shippingAddress.address1,
      city: shippingAddress.city,
      state: shippingAddress.state || shippingAddress.city,
      zipCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    } : undefined,
  }),
  'Direct order creation'
);
```

### Step 2: Update Cart-Based Order to Include Shipping
**File**: `src/pages/Checkout.tsx`

The cart-based `placeOrder` currently only passes `clientId`. We need to either:
- A) Update the API to accept shipping in cart-based orders, OR
- B) Update the client's shipping address BEFORE placing the order

**Solution**: Update shipping address before cart-based order placement.

```javascript
// Before placing order, ensure shipping is synced
if (shippingAddress && drGreenClient?.drgreen_client_id) {
  await updateShippingAddress(drGreenClient.drgreen_client_id, shippingAddress);
}
```

### Step 3: Update the useDrGreenApi Hook (Type Alignment)
**File**: `src/hooks/useDrGreenApi.ts`

Ensure the `createOrder` shipping address type matches what the edge function expects per the Dr. Green API docs:

```typescript
shippingAddress?: {
  street?: string;     // maps to address1
  address1?: string;   // alternative field name
  address2?: string;   // optional
  city?: string;
  state?: string;
  zipCode?: string;    // maps to postalCode
  postalCode?: string; // alternative field name
  country?: string;
  countryCode?: string;
};
```

### Step 4: Update Edge Function Field Mapping
**File**: `supabase/functions/drgreen-proxy/index.ts`

Update the `create-order` action to handle both field naming conventions:

```typescript
if (orderData.shippingAddress) {
  const addr = orderData.shippingAddress;
  orderPayload.shippingAddress = {
    address1: addr.street || addr.address1,
    address2: addr.address2 || '',
    landmark: addr.landmark || '',
    city: addr.city,
    state: addr.state || addr.city,
    country: addr.country,
    countryCode: addr.countryCode || getCountryCode(addr.country),
    postalCode: addr.zipCode || addr.postalCode,
  };
}
```

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Checkout.tsx` | Pass `shippingAddress` to `createOrder` and sync before `placeOrder` |
| `src/hooks/useDrGreenApi.ts` | Align shipping address types with API schema |
| `supabase/functions/drgreen-proxy/index.ts` | Handle both field naming conventions for shipping |

### API Documentation Reference

Per the provided Orders API Documentation:

```json
{
  "clientId": "client-uuid-here",
  "items": [...],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "notes": "Optional notes"
}
```

### Testing Checklist

After implementation:
1. Log in as Kayliegh (verified patient)
2. Add item to cart
3. Proceed to checkout
4. Verify shipping address form appears (since API returns 401)
5. Fill in shipping address
6. Click "Place Order"
7. Verify order is created successfully with shipping address attached
8. Check order details in admin dashboard to confirm address was saved

## Summary

The shipping address is collected via the form but never passed to the order creation API. This fix ensures the address flows through the entire checkout process, whether using cart-based or direct order creation methods.
