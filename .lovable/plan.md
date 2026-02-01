

# Fix: Shipping Address Form State Persistence ✅ COMPLETED

## Problem Identified
During end-to-end testing, the shipping address form on the checkout page resets after clicking "Save & Continue". The form values don't persist and no API call is made to save the address.

## Root Cause
The `ShippingAddressForm` component is designed to call `onSuccess` with the address data, which then sets `needsShippingAddress(false)` in the parent Checkout component. However, when this state change occurs, the `useEffect` re-fetched and overwrote the manually-saved address.

## Fix Applied
Added `addressManuallySaved` flag to prevent useEffect from overwriting manually saved addresses.

---

# Fix: Cart Sync Before Order Placement ✅ COMPLETED

## Problem Identified
Dr. Green API returns 409 "Client does not have any item in the cart" when attempting to create an order.

## Root Cause
The Dr. Green API requires items to be in their server-side cart system before an order can be placed. The application was managing cart locally but not syncing to Dr. Green's cart.

## Fix Applied
1. Added cart sync step in `handlePlaceOrder` before order creation
2. Iterates through local cart items and calls `addToCart` for each
3. Tries `placeOrder` (cart-based) first, falls back to `createOrder` (direct) if needed
4. Added `addToCart` and `placeOrder` to hook destructuring

## Files Modified
- `src/pages/Checkout.tsx` - Cart sync before order, fallback logic
