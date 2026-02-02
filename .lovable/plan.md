
# Order Creation 401 Fix: NFT-Scoped Access Constraint

## Summary

The "Authorization failed... [AUTH_FAILED] (Status 401)" error occurs because Kayliegh's Dr. Green client record was created under different API credentials than those currently configured. The Dr. Green API enforces **NFT-scoped isolation**: a client record created by one API key cannot be modified or used for orders by a different API key.

---

## Technical Background

### How Dr. Green API Authentication Works (From Your Documentation)

1. **x-auth-apikey**: Base64-encoded API key (public identifier)
2. **x-auth-signature**: Base64-encoded cryptographic signature of the request payload (created with the private key)

The server:
- Verifies the signature matches the registered public key
- Checks if the API key has permission to operate on the `clientId`

### Why 401 Occurs

The current Healing Buds API credentials can:
- Create NEW client records (under their own NFT scope)
- Read products/strains (public endpoints)
- Sign requests correctly (signature verification passes)

But they CANNOT:
- PATCH, POST carts, or POST orders for clients created under different credentials
- Access client details via GET /dapp/clients/{id} (admin-only or different scope)

---

## Proposed Solution Options

### Option A: Re-Register Client Under Current Credentials (RECOMMENDED)

Since Kayliegh's client record in Dr. Green was created under different credentials, we need to create a new one under the current 'healingbudscoza' scope.

**Implementation Steps:**
1. Add a "Re-Sync with Backend" action in the patient dashboard
2. When triggered, call `POST /dapp/clients` with the user's current profile data
3. Store the NEW `drgreen_client_id` in the local `drgreen_clients` table
4. The new client will need to complete KYC again via the Dr. Green portal

**Pros:**
- Works with existing credentials
- Proper NFT-scoped record ownership

**Cons:**
- User must re-complete KYC verification
- Old client record becomes orphaned in Dr. Green

### Option B: Admin Credential Escalation

If Healing Buds has access to admin-level API credentials, those could bypass NFT-scoping restrictions.

**Implementation Steps:**
1. Add new secrets: `DRGREEN_ADMIN_API_KEY` and `DRGREEN_ADMIN_PRIVATE_KEY`
2. Use admin credentials for order operations
3. Keep standard credentials for client creation (so records are NFT-scoped for tracking)

**Pros:**
- No re-registration required for existing users
- Can operate on any client record

**Cons:**
- Requires admin credentials from Dr. Green team
- May not be available or appropriate for this integration

### Option C: Offline/Mock Mode for Testing

Enable a mock mode that bypasses Dr. Green API calls entirely for testing purposes.

**Implementation Steps:**
1. Add `DRGREEN_MOCK_MODE=true` secret
2. When enabled, `create-order` returns simulated success with mock order ID
3. Useful for UI/UX testing without API dependencies

**Pros:**
- Immediate testing capability
- No API dependency for development

**Cons:**
- Only for testing, not production-ready
- Orders don't actually reach Dr. Green

---

## Recommended Implementation: Option A + Option C

### Phase 1: Add Mock Mode for Immediate Testing
- Add `DRGREEN_MOCK_MODE` environment check
- Return mock order data when enabled
- Allows full checkout flow testing

### Phase 2: Add Client Re-Registration Flow
- Create "Re-Sync Account" button in patient dashboard
- Show clear messaging: "Your account needs to be re-linked to our prescription system"
- Call create-client-legacy with current profile data
- Update local record with new `drgreen_client_id`
- Trigger KYC link display

### Phase 3: Update Documentation
- Document the NFT-scoped constraint in DRGREEN-API-INTEGRATION.md
- Add troubleshooting section for 401 errors
- Note that clients created during testing may need re-registration

---

## Code Changes Summary

### Edge Function (`drgreen-proxy/index.ts`)
- Add `DRGREEN_MOCK_MODE` check at start of `create-order` handler
- Return mock success response when enabled:
```typescript
if (Deno.env.get('DRGREEN_MOCK_MODE') === 'true') {
  return new Response(JSON.stringify({
    success: true,
    orderId: `mock_${requestId}`,
    message: '[MOCK MODE] Order simulated successfully',
    items: orderData.items,
  }), { headers: corsHeaders, status: 200 });
}
```

### Patient Dashboard (`PatientDashboard.tsx`)
- Add "Re-Sync Account" action for users experiencing order failures
- Display clear explanation of why re-sync is needed

### Documentation (`DRGREEN-API-INTEGRATION.md`)
- Add "NFT-Scoped Access" section explaining the constraint
- Add "Key Rotation / Re-Registration" troubleshooting

---

## Immediate Next Steps

1. **Confirm with Dr. Green Team**: Which NFT/credentials were used to create Kayliegh's record?
2. **Decide on Option**: Mock mode for immediate testing, or re-registration for production fix
3. **Implement chosen solution**: I can implement any of the options above

---

## Technical Details for Reference

### Current Credentials in Use
- `DRGREEN_API_KEY`: Configured (Base64-encoded public key)
- `DRGREEN_PRIVATE_KEY`: Configured (secp256k1 PKCS#8 format)
- Associated dApp: 'healingbudscoza'
- NFT Owner: 0x0b60d85fefcd9064a29f7df0f8cbc7901b9e6c84

### Kayliegh's Client Record
- Local ID: `47542db8-3982-4204-bd32-2f36617c5d3d`
- Status: `is_kyc_verified: true`, `admin_approval: VERIFIED`
- Country: ZA
- Issue: Client record created under different NFT scope

### API Flow That Fails
```text
Frontend Checkout
       │
       ▼
drgreen-proxy (create-order)
       │
       ├─► Step 1: PATCH /dapp/clients/{id} → 401 Unauthorized
       │
       ├─► Step 2: POST /dapp/carts → 401 Unauthorized
       │
       └─► Step 3: POST /dapp/orders → 401 Unauthorized
```

The 401 occurs because the API key doesn't "own" this client record.
