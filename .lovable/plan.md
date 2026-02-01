

# Plan: Shipping Address Management - Onboarding Requirement + Address Change

## Problem Summary

The Dr. Green API returns a 400 error "Client shipping address not found" when creating an order, because:
1. The current onboarding flow collects an address but may not be properly synced to Dr. Green API
2. Users who registered before shipping was required have no address on file
3. There's no way for users to update their shipping address after registration

---

## Proposed Solution

We will implement a two-part solution:

### Part 1: Ensure Shipping Address During Onboarding
The address step already exists (Step 2 in `ClientOnboarding.tsx`), but we need to:
- Verify the address data is being sent correctly in the `shipping` object format required by Dr. Green API
- Add explicit validation that shipping fields are mandatory before submission

### Part 2: Allow Address Changes Post-Registration
Add a shipping address management feature:
- **In Checkout**: Detect missing shipping address and show an inline form to collect/update it before order placement
- **In Patient Dashboard**: Add an "Edit Shipping Address" section so patients can update their address anytime

---

## User Experience Flow

```text
Scenario A: New Registration
-----------------------------
1. User fills personal details (Step 1)
2. User fills shipping address (Step 2) ← Required, validated
3. User continues through medical questionnaire
4. Shipping address synced to Dr. Green on registration

Scenario B: Existing User Without Address
------------------------------------------
1. User tries to checkout
2. Checkout detects missing shipping address
3. Shows inline "Add Shipping Address" form
4. User fills address, clicks "Save & Continue"
5. Address updated via PATCH /dapp/clients/:clientId
6. Order proceeds normally

Scenario C: User Wants to Change Address
-----------------------------------------
1. User goes to Patient Dashboard
2. Clicks "Edit Shipping Address" in Account section
3. Modal/form appears with current address (or empty)
4. User updates address, clicks "Save"
5. Address updated via PATCH /dapp/clients/:clientId
```

---

## Technical Changes

### 1. New Component: ShippingAddressForm
**File:** `src/components/shop/ShippingAddressForm.tsx`

A reusable form component for collecting/editing shipping addresses with:
- Fields: address1, address2 (optional), city, state (optional), postalCode, country
- Validation using Zod schema
- Country-specific postal code validation
- "Save" button that calls `patchClient` API

### 2. Update Checkout Page
**File:** `src/pages/Checkout.tsx`

Add shipping address detection and inline form:
- Fetch client details from Dr. Green API on load to check for shipping address
- If shipping address missing, show `ShippingAddressForm` before the Place Order button
- Block order placement until address is saved
- Handle the "Client shipping address not found" error gracefully with a prompt to add address

### 3. Update Patient Dashboard
**File:** `src/pages/PatientDashboard.tsx`

Add address management in the Account section:
- Display current shipping address (if available)
- "Edit Address" button opens a dialog with `ShippingAddressForm`
- On save, updates both Dr. Green API and local context

### 4. Extend useDrGreenApi Hook
**File:** `src/hooks/useDrGreenApi.ts`

Expand `patchClient` to explicitly handle shipping address updates:
- Current interface only has basic fields
- Add proper shipping object support per API documentation

### 5. Update drgreen-proxy Edge Function
**File:** `supabase/functions/drgreen-proxy/index.ts`

Add a new action or update `patch-client` to handle shipping address specifically:
- Map frontend field names to API-required format
- Ensure `countryCode` is converted to Alpha-3 (e.g., PT to PRT)

### 6. Verify ClientOnboarding Sends Correct Format
**File:** `src/components/shop/ClientOnboarding.tsx`

Audit the `buildLegacyClientPayload` function to ensure shipping address is:
- Included in the correct `shipping` object structure
- Has all required fields (address1, city, country, countryCode, postalCode)

---

## API Payload Format Reference

Per Dr. Green API documentation, the shipping object should be:

```json
{
  "shipping": {
    "address1": "123 Main Street",
    "address2": "",
    "landmark": "",
    "city": "Lisbon",
    "state": "Lisbon",
    "country": "Portugal",
    "countryCode": "PRT",
    "postalCode": "1000-001"
  }
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/shop/ShippingAddressForm.tsx` | **Create** | Reusable shipping address form component |
| `src/pages/Checkout.tsx` | Modify | Add address detection and inline form |
| `src/pages/PatientDashboard.tsx` | Modify | Add address display and edit capability |
| `src/hooks/useDrGreenApi.ts` | Modify | Expand patchClient for shipping address |
| `supabase/functions/drgreen-proxy/index.ts` | Modify | Ensure patch-client handles shipping object |
| `src/components/shop/ClientOnboarding.tsx` | Audit | Verify shipping data format |

---

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| User has no shipping address | Checkout shows form, blocks order |
| User wants to ship to different address | Can edit in dashboard or checkout |
| Country code conversion | PT to PRT, GB to GBR, etc. |
| Postal code validation | Country-specific regex patterns |
| API update fails | Show error toast, keep form open for retry |
| Address saved successfully | Refresh client data, proceed with order |

---

## Testing Checklist

After implementation:
1. Register new user and verify shipping address is synced to Dr. Green
2. Login as Kayliegh (existing user without address)
3. Go to checkout and verify address form appears
4. Fill address and save
5. Verify order can now be placed
6. Go to dashboard and verify address can be edited
7. Change address and verify update persists

