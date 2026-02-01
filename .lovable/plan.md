

# Fix: Shipping Address Form State Persistence

## Problem Identified
During end-to-end testing, the shipping address form on the checkout page resets after clicking "Save & Continue". The form values don't persist and no API call is made to save the address.

## Root Cause
The `ShippingAddressForm` component is designed to call `onSuccess` with the address data, which then sets `needsShippingAddress(false)` in the parent Checkout component. However, when this state change occurs, the component may be unmounting/remounting, causing the form to reset before the address is properly captured.

## Technical Fix

### File: `src/pages/Checkout.tsx`

Update the `handleShippingAddressSaved` function to ensure address is captured before state change:

```typescript
const handleShippingAddressSaved = (address: ShippingAddress) => {
  console.log('[Checkout] Address saved:', address);
  // Set address FIRST, before changing needsShippingAddress
  setShippingAddress(address);
  setSavedAddress(address); // Also save as "saved" address
  // Then update state to show the address selection UI
  setNeedsShippingAddress(false);
  setAddressMode('saved');
  toast({
    title: 'Shipping Address Saved',
    description: 'You can now proceed with your order.',
  });
};
```

### File: `src/components/shop/ShippingAddressForm.tsx`

Add console logging to debug form submission:

```typescript
const handleSubmit = async (data: AddressFormData) => {
  console.log('[ShippingAddressForm] Form submitted with:', data);
  setIsSaving(true);
  // ... rest of logic
  
  // Before calling onSuccess
  console.log('[ShippingAddressForm] Calling onSuccess with:', shippingData);
  onSuccess?.(shippingData);
};
```

## Testing After Fix

1. Log in as kayliegh.sm@gmail.com
2. Add item to cart
3. Go to checkout
4. Fill in Pretoria address (123 Church Street, Pretoria, Gauteng, 0001)
5. Click "Save & Continue"
6. Verify address persists and "Place Order" button becomes active
7. Click "Place Order" to test full order creation with shipping in payload
8. Check drgreen-proxy logs to confirm order includes shipping address

## Files to Modify
- `src/pages/Checkout.tsx` - Add logging and fix state order
- `src/components/shop/ShippingAddressForm.tsx` - Add debug logging

