
# Fix: Dr. Green API 401 Authentication Errors

## Problem Summary

The checkout flow is blocked because `GET /dapp/clients/{clientId}` returns 401 Unauthorized. This prevents fetching the client's shipping address, forcing users to re-enter address details.

**Verified Data:**
- Kayliegh's profile: `is_kyc_verified=true`, `admin_approval=VERIFIED`, `country_code=ZA`
- Dr. Green Client ID: `47542db8-3982-4204-bd32-2f36617c5d3d`
- Currency conversion is now working correctly (EUR to ZAR)

## Root Cause Analysis

Comparing the current implementation against the official API documentation provided:

### Issue 1: API Key Encoding

**Documentation says:**
```javascript
'x-auth-apikey': Buffer.from(apiKey).toString('base64')
```

**Current implementation (line 859 & 970):**
```javascript
"x-auth-apikey": apiKey,  // Assumes already Base64-encoded
```

The API key stored in `DRGREEN_API_KEY` may be the **raw API key**, not Base64-encoded. The code needs to Base64-encode it before sending.

### Issue 2: No Graceful Fallback

When the `getClientDetails` API call fails (401), the checkout shows the shipping address form even if the user has already provided their address. There's no local cache fallback.

## Solution

### Part 1: Fix API Key Encoding in Edge Function

**File:** `supabase/functions/drgreen-proxy/index.ts`

Update both `drGreenRequestBody` and `drGreenRequestGet` functions to Base64-encode the API key:

```typescript
// Before (assumes pre-encoded):
"x-auth-apikey": apiKey,

// After (encode before sending):
"x-auth-apikey": btoa(apiKey),
```

**Affected locations:**
- Line 859 in `drGreenRequestBody`
- Line 970 in `drGreenRequestGet`

Add a check to avoid double-encoding:
```typescript
// Smart encoding - only encode if not already Base64
const isAlreadyBase64 = /^[A-Za-z0-9+/=]+$/.test(apiKey) && apiKey.length > 20;
const encodedApiKey = isAlreadyBase64 ? apiKey : btoa(apiKey);
```

### Part 2: Add Local Shipping Cache (Graceful Fallback)

**File:** `src/pages/Checkout.tsx`

Update the `checkShippingAddress` effect to fallback to prompting for address entry gracefully, with a clear message that explains the situation:

```typescript
// If API fails, check if user has recently saved address in session
// If not, show shipping form with helpful message
catch (error) {
  console.error('Failed to fetch client details:', error);
  // Show shipping form with context that we couldn't verify existing address
  setNeedsShippingAddress(true);
  toast({
    title: 'Address Verification',
    description: 'Please confirm your shipping address to continue.',
  });
}
```

### Part 3: Add Logging for Diagnosis

Add detailed logging to identify whether the 401 is from:
1. Incorrect API key format
2. Incorrect signature
3. Missing permissions for specific endpoints

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Base64-encode API key before sending |
| `src/pages/Checkout.tsx` | Improve error handling with user-friendly messaging |

## Testing Plan

After implementation:
1. Deploy edge function changes
2. Have Kayliegh navigate to checkout
3. Verify `get-my-details` returns 200 OK (not 401)
4. If 401 persists, check logs for specific error details
5. Verify shipping address displays correctly
6. Complete a test order placement

## Risk Assessment

- **Low Risk**: Base64 encoding change is straightforward
- **Fallback**: If the API key is already properly encoded, we need to detect and avoid double-encoding
- **No Data Loss**: This is a display/API fix only - no database changes

## Alternative: Credential Verification

If the 401 persists after the encoding fix, the credentials may need to be verified with Dr. Green:
- Confirm API key is correct
- Confirm API key has access to `/dapp/clients/{id}` endpoint
- Check if there are IP restrictions or rate limits
