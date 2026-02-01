

# Fix Dr. Green API Key Double-Encoding Issue

## Problem Identified

The `DRGREEN_API_KEY` secret is correctly stored as a **Base64-encoded public key** (as per Dr. Green API requirements). However, the proxy code is **double-encoding** it:

```
Current flow:
1. DRGREEN_API_KEY = "LS0tLS1CRUdJTi..." (232 chars, already Base64)
2. Code does: btoa(apiKey) → "TFMwdExTMUNS..." (312 chars, double-encoded)
3. Dr. Green rejects: Cannot decode the double-encoded key
```

The user-provided credentials are correct:
- **API Key**: `LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0K...` (Base64-encoded public key)
- **Private Key**: `LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...` (Base64-encoded private key)

---

## Solution

### 1. Update Secret Value
Store the provided API key in `DRGREEN_API_KEY`:
```
LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVuN1dKY2l3NEFnSUlKQy9hQnlqdEhnSDEvR0tJWnJwVwo2NnBDcXB1ZndNZzFpUVZuNzdBRTYrTDhDYlZkZHQvQlNURXdLL1ZTT0tPeU1yaGNHUFBnaFE9PQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0K
```

### 2. Fix Proxy Code - Remove Double-Encoding

**File: `supabase/functions/drgreen-proxy/index.ts`**

Update both `drGreenRequestBody` (~line 858) and `drGreenRequestGet` (~line 980):

```typescript
// BEFORE (wrong - double-encodes)
const encodedApiKey = btoa(apiKey);

// AFTER (correct - key is already Base64-encoded)
// The API key from secrets is already Base64-encoded per Dr. Green spec
const encodedApiKey = apiKey;
```

Also add a validation check to detect if the key appears to be a raw PEM format (shouldn't happen with correct config):

```typescript
// Validate API key format - should be Base64-encoded, not raw PEM
if (apiKey.startsWith('-----BEGIN')) {
  console.error('[API-ERROR] DRGREEN_API_KEY contains raw PEM format. It should be Base64-encoded.');
  throw new Error('API key misconfigured - contact administrator');
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Remove `btoa()` calls at lines ~858 and ~980; add format validation |

---

## Expected Outcome

After this fix:
1. API key will be sent as-is (already Base64-encoded): `LS0tLS1CRUdJTi...`
2. Dr. Green API will correctly decode and validate the public key
3. DApp endpoints (`/dapp/clients`, `/dapp/orders`, etc.) will return **200 OK** instead of **401 Unauthorized**

---

## Testing Plan

1. Deploy updated edge function
2. Run `api-diagnostics` action to verify both strains AND dapp/clients return 200
3. Log in as Kayliegh and complete checkout flow

