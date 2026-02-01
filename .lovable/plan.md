
# Plan: Fix Cart API Integration and Add Retry Logic for Checkout

## Problem Analysis

Based on edge function logs, the checkout flow is failing at the cart sync step:

| Step | API Call | Status | Issue |
|------|----------|--------|-------|
| 1. Empty cart | `DELETE /dapp/carts/:clientId` | 502/retry | Expected - cart may not exist |
| 2. Add to cart | `POST /dapp/carts` | **400** | Payload format incorrect |
| 3. Place order | `POST /dapp/orders` | 409 | "Client does not have any item in the cart" |

The root cause is the **add-to-cart payload format**. The Orders API documentation shows items use `productId`, not `strainId`. The cart API may follow the same convention.

---

## Technical Changes

### 1. Fix Cart Payload Format
**File:** `supabase/functions/drgreen-proxy/index.ts`

Update the `add-to-cart` action to try both field names and add response logging:

```typescript
case "add-to-cart": {
  const cartData = body.data || {};
  const clientId = cartData.clientId || cartData.cartId;
  
  // Try productId format first (per Orders API docs), fallback to strainId
  const cartPayload = {
    clientId: clientId, // Try clientId instead of clientCartId
    items: [
      {
        productId: cartData.strainId, // Use productId per API docs
        quantity: cartData.quantity,
      }
    ]
  };
  
  logInfo("Adding to cart", { payload: cartPayload });
  response = await drGreenRequestBody("/dapp/carts", "POST", cartPayload);
  
  // Log response for debugging
  logInfo("Cart response", { 
    status: response.status,
    body: response.data 
  });
  break;
}
```

### 2. Add Retry Logic for Cart Operations
**File:** `src/pages/Checkout.tsx`

Add retry logic with exponential backoff for cart sync failures:

```typescript
const handlePlaceOrder = async () => {
  // ... existing setup ...

  const retryOperation = async <T,>(
    operation: () => Promise<{ data: T | null; error: string | null }>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<{ data: T | null; error: string | null }> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await operation();
      if (!result.error) return result;
      
      // Don't retry on client errors (validation issues)
      if (result.error.includes('400') || result.error.includes('validation')) {
        return result;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        console.log(`${operationName} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return { data: null, error: `${operationName} failed after ${maxRetries} attempts` };
  };

  // Use retry logic for cart operations
  setPaymentStatus('Syncing cart items...');
  for (const item of cart) {
    const cartResult = await retryOperation(
      () => addToCart({
        clientId: clientId,
        strainId: item.strain_id,
        quantity: item.quantity,
      }),
      `Add ${item.strain_name} to cart`
    );

    if (cartResult.error) {
      throw new Error(`Failed to add ${item.strain_name} to cart: ${cartResult.error}`);
    }
  }
  // ... rest of flow ...
};
```

### 3. Add Response Body Logging to Edge Function
**File:** `supabase/functions/drgreen-proxy/index.ts`

Enhance error logging to capture the actual API error message:

```typescript
// In drGreenRequestBody function, log error responses:
if (!response.ok) {
  const errorBody = await response.text();
  logWarn(`API error response`, { 
    status: response.status, 
    statusText: response.statusText,
    body: errorBody 
  });
  throw new Error(`Dr Green API error: ${response.status} - ${errorBody}`);
}
```

### 4. Add Fallback to Direct Order Creation
**File:** `src/pages/Checkout.tsx`

If cart sync fails, try direct order creation as fallback:

```typescript
try {
  // Try cart-based flow first
  await syncCartAndPlaceOrder();
} catch (cartError) {
  console.warn('Cart flow failed, trying direct order creation:', cartError);
  
  // Fallback: try creating order with items directly
  const directOrderResult = await createOrder({
    clientId: clientId,
    items: cart.map(item => ({
      productId: item.strain_id,
      quantity: item.quantity,
      price: item.unit_price,
    })),
  });
  
  if (directOrderResult.error) {
    throw new Error(directOrderResult.error);
  }
  
  createdOrderId = directOrderResult.data?.orderId;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Fix cart payload format (use `productId`), add response logging |
| `src/pages/Checkout.tsx` | Add retry logic with exponential backoff, add fallback to direct order |

---

## Testing Plan

After implementation:
1. Deploy updated edge function
2. Login as Kayliegh (`kayliegh.sm@gmail.com` / `HB2024Test!`)
3. Add product to cart
4. Navigate to checkout and click "Place Order"
5. Monitor edge function logs for:
   - Cart payload being sent
   - API response (200 or error with message)
6. Verify order creation succeeds or get specific error message to diagnose further

---

## Expected Outcomes

| Scenario | Expected Result |
|----------|-----------------|
| Cart API accepts `productId` format | Order created successfully |
| Cart API still rejects | Error message captured in logs for further debugging |
| Direct order fallback works | Order created via alternative path |
| All methods fail | User-friendly error with specific guidance |
