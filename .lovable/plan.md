
# Update API Integration with Official Dr. Green Documentation

## Overview
Update the Dr. Green API integration to align with the comprehensive official documentation provided. This includes correcting the staging URL, adding missing API endpoints, and enhancing the comparison dashboard with new data types.

---

## Key Issues to Address

### 1. Staging URL Correction
**Current**: `https://budstack-backend-main-development.up.railway.app/api/v1` (Railway dev)
**Official**: `https://stage-api.drgreennft.com/api/v1` (Official staging)

The Railway URL may be an internal development instance. The official staging URL should be used for proper staging comparisons.

**Action**: Update `drgreen-comparison` and any staging proxy to support both:
- Official staging: `https://stage-api.drgreennft.com/api/v1`
- Railway dev: `https://budstack-backend-main-development.up.railway.app/api/v1` (optional/secondary)

### 2. Missing API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/dapp/clients/summary` | GET | Client summary stats (PENDING/VERIFIED/REJECTED counts) | Missing |
| `/dapp/sales` | GET | Sales data with filtering | Missing |
| `/dapp/sales/summary` | GET | Sales summary by stage | Missing |
| `/dapp/client/:clientId/orders` | GET | Orders for specific client | Missing |
| `/user/me` | GET | Current user + primary NFT details | Exists (`get-user-me`) |
| `/dapp/users/nfts` | GET | User's owned NFTs | Missing |

### 3. Response Structure Updates
The documentation confirms the response format:
```json
{
  "success": boolean,
  "statusCode": number,
  "message": string,
  "data": { ... }
}
```

And pagination structure:
```json
{
  "pageMetaDto": {
    "page": "1",
    "take": "10",
    "itemCount": 50,
    "pageCount": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

## Implementation Plan

### Phase 1: Update Staging Configuration

**File**: `supabase/functions/drgreen-comparison/index.ts`

1. Add support for official staging URL:
```typescript
const ENV_CONFIG = {
  production: {
    apiUrl: 'https://api.drgreennft.com/api/v1',
    // ...
  },
  staging: {
    apiUrl: 'https://stage-api.drgreennft.com/api/v1', // Official staging
    // ...
  },
  railway: {
    apiUrl: 'https://budstack-backend-main-development.up.railway.app/api/v1', // Dev
    // ...
  }
};
```

2. Add `environment` option to select between staging and railway dev.

### Phase 2: Add Missing Actions to drgreen-proxy

**File**: `supabase/functions/drgreen-proxy/index.ts`

Add new action handlers:

1. **`get-clients-summary`** → `GET /dapp/clients/summary`
2. **`get-sales`** → `GET /dapp/sales` (with stage filter: LEADS, ONGOING, CLOSED)
3. **`get-sales-summary`** → `GET /dapp/sales/summary`
4. **`get-client-orders`** → `GET /dapp/client/:clientId/orders`
5. **`get-user-nfts`** → `GET /dapp/users/nfts`

### Phase 3: Update useDrGreenApi Hook

**File**: `src/hooks/useDrGreenApi.ts`

Add new methods:
```typescript
// Get client summary (PENDING/VERIFIED/REJECTED counts)
const getClientsSummary = async () => {
  return callProxy<{
    summary: {
      PENDING: number;
      VERIFIED: number;
      REJECTED: number;
      totalCount: number;
    };
  }>('get-clients-summary');
};

// Get sales with optional stage filter
const getSales = async (params?: {
  stage?: 'LEADS' | 'ONGOING' | 'CLOSED';
  page?: number;
  take?: number;
}) => {
  return callProxy<{
    sales: Array<{
      id: string;
      stage: string;
      client: { firstName: string; lastName: string; };
      createdAt: string;
    }>;
    pageMetaDto: PageMetaDto;
  }>('get-sales', params);
};

// Get user's owned NFTs
const getUserNfts = async () => {
  return callProxy<{
    nfts: Array<{
      tokenId: number;
      nftMetadata: { nftName: string; nftType: string; imageUrl: string; };
      owner: { fullName: string; walletAddress: string; };
    }>;
  }>('get-user-nfts');
};
```

### Phase 4: Enhance Comparison Dashboard

**File**: `src/components/admin/ApiComparisonDashboard.tsx`

1. Add **Sales** tab to compare sales data between environments
2. Add **environment selector** to switch between:
   - Production vs Official Staging
   - Production vs Railway Dev

3. Add **Client Summary** comparison showing:
   - PENDING count comparison
   - VERIFIED count comparison
   - REJECTED count comparison

### Phase 5: Add Sales Dashboard Component (New)

**File**: `src/components/admin/SalesDashboard.tsx`

Create a new component to display:
- Sales pipeline by stage (LEADS → ONGOING → CLOSED)
- Sales summary statistics
- Client conversion funnel

---

## Technical Details

### Medical Questionnaire Options (for reference)
The documentation provides complete lists of valid values for:
- Medical conditions (40+ options)
- Prescribed medicines/treatments (70+ options)
- Cannabis usage frequency
- Cannabis usage methods

These should be validated client-side during client creation/onboarding.

### Status Values (for display/filtering)
| Type | Values |
|------|--------|
| Admin Approval | `PENDING`, `VERIFIED`, `REJECTED` |
| Order Status | `PENDING`, `DELIVERED`, `CANCELLED` |
| Payment Status | `PENDING`, `PAID`, `FAILED` |
| Sales Stage | `LEADS`, `ONGOING`, `CLOSED` |

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `supabase/functions/drgreen-comparison/index.ts` | Update | Add official staging URL, support multiple staging environments |
| `supabase/functions/drgreen-proxy/index.ts` | Update | Add 5 new action handlers for missing endpoints |
| `src/hooks/useDrGreenApi.ts` | Update | Add new methods for sales, client summary, NFTs |
| `src/components/admin/ApiComparisonDashboard.tsx` | Update | Add Sales tab, environment selector |
| `src/components/admin/SalesDashboard.tsx` | Create | New sales pipeline component |
| `src/pages/AdminDashboard.tsx` | Update | Integrate SalesDashboard |

---

## Testing After Implementation

1. **Comparison Dashboard**: Verify side-by-side display of production vs staging data
2. **Sales API**: Test `get-sales` and `get-sales-summary` endpoints
3. **Client Summary**: Verify counts match between local DB and Dr. Green API
4. **NFT List**: Verify user's owned NFTs are displayed correctly

---

## Dependencies
- No new packages required
- Reuses existing UI components (Tabs, Table, Card, Badge)
- Reuses existing edge function patterns
