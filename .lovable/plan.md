

# Fix Checkout Flow - Dr. Green API Cart Sync

## Problem Summary

The checkout is failing with a **409 Conflict: "Client does not have any item in the cart"** error because the Dr. Green API requires items to be added to its server-side cart before placing an order.

**Current (broken) flow:**
Local cart → Create Order → ERROR

**Required flow:**
Local cart → Sync to Dr. Green Cart → Create Order → Success

---

## Solution: Sync Cart Before Order

### Phase 1: Add Cart Sync Function

**File: `src/hooks/useDrGreenApi.ts`**

Add a new `addToCart` function to expose the existing `add-to-cart` action:

```typescript
// Add item to Dr. Green cart
const addToCart = async (cartData: {
  cartId: string;
  strainId: string;
  quantity: number;
}) => {
  return callProxy<{
    cartId: string;
    items: Array<{ strainId: string; quantity: number }>;
  }>('add-to-cart', { data: cartData });
};
```

Also add `emptyCart` function to clear the Dr. Green cart before syncing:

```typescript
// Empty the Dr. Green cart
const emptyCart = async (cartId: string) => {
  return callProxy<{ success: boolean }>('empty-cart', { cartId });
};
```

---

### Phase 2: Update Checkout Flow

**File: `src/pages/Checkout.tsx`**

Modify `handlePlaceOrder` to sync cart items before creating the order:

```text
1. Get or create Dr. Green cart ID (use client ID as cart ID)
2. Empty existing cart to ensure clean state
3. Add each local cart item to Dr. Green cart
4. Create order (without sending items - they're already in cart)
5. Process payment as before
```

Updated flow in `handlePlaceOrder`:

```typescript
const handlePlaceOrder = async () => {
  if (!drGreenClient || cart.length === 0) return;

  setIsProcessing(true);
  setPaymentStatus('Syncing cart...');

  try {
    const clientId = drGreenClient.drgreen_client_id;
    
    // Step 1: Empty existing Dr. Green cart to ensure clean state
    await emptyCart(clientId);
    
    // Step 2: Add each item to Dr. Green cart
    for (const item of cart) {
      const result = await addToCart({
        cartId: clientId,
        strainId: item.strain_id,
        quantity: item.quantity,
      });
      
      if (result.error) {
        throw new Error(`Failed to add ${item.strain_name} to cart: ${result.error}`);
      }
    }
    
    setPaymentStatus('Creating order...');
    
    // Step 3: Create order (items are now in Dr. Green cart)
    const orderResult = await createOrder({
      clientId: clientId,
    });
    
    // ... rest of payment flow unchanged
  } catch (error) {
    // Error handling
  }
};
```

---

### Phase 3: Verify Cart API Actions Work

The `drgreen-proxy` edge function already has the required actions:

| Action | Endpoint | Purpose |
|--------|----------|---------|
| `add-to-cart` | `POST /dapp/carts` | Add item to cart |
| `empty-cart` | `DELETE /dapp/carts/:cartId` | Clear cart |
| `place-order` | `POST /dapp/orders` | Create order from cart |

Note: The `create-order` action uses `drGreenRequest` (query signing) while `place-order` uses `drGreenRequestBody` (body signing). We may need to use `place-order` instead.

---

## Technical Details

### API Flow Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                      User Clicks "Place Order"              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Empty existing Dr. Green cart                       │
│ DELETE /dapp/carts/{clientId}                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: For each local cart item, add to Dr. Green cart     │
│ POST /dapp/carts { cartId, strainId, quantity }             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Create order from Dr. Green cart                    │
│ POST /dapp/orders { clientId }                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Create payment                                      │
│ POST /dapp/payments { orderId, amount, currency, clientId } │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Poll payment status or await webhook                │
│ GET /dapp/payments/{paymentId}                              │
└─────────────────────────────────────────────────────────────┘
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDrGreenApi.ts` | Add `addToCart()` and `emptyCart()` functions |
| `src/pages/Checkout.tsx` | Update `handlePlaceOrder` to sync cart before order |

### Edge Cases to Handle

1. **Cart sync failure**: If adding an item fails, abort and show error
2. **Partial sync**: If some items sync but order fails, items remain in Dr. Green cart
3. **Stock changes**: Stock may have changed between browsing and checkout

---

## Expected Outcome

After implementation:
1. **Kayliegh** can complete checkout: Items sync to Dr. Green cart → Order created successfully
2. **Scott** can complete checkout: Same flow works for all verified clients
3. Error handling provides clear feedback if cart sync or order creation fails

---

## Test Plan

1. Login as Kayliegh (`kayliegh.sm@gmail.com` / `HB2024Test!`)
2. Add a product to cart
3. Proceed to checkout
4. Click "Place Order"
5. Verify order is created successfully (no 409 error)
6. Check order appears in `/orders` page
7. Repeat with Scott to confirm both users work

