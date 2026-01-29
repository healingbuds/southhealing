
# API Comparison Dashboard

## Overview
Create a dedicated admin component that fetches data from both production and staging Dr. Green APIs simultaneously, displaying side-by-side comparisons for strains, clients, and orders. This enables administrators to verify data parity between environments and quickly identify discrepancies.

---

## Architecture

```text
+----------------------------------+
|     ApiComparisonDashboard       |
+----------------------------------+
|  [Environment Selector Tabs]    |
|  - Strains | Clients | Orders   |
+----------------------------------+
|  PRODUCTION    |    STAGING     |
|  -----------   |   -----------  |
|  Strain List   |   Strain List  |
|  Client Count  |   Client Count |
|  Order Stats   |   Order Stats  |
+----------------------------------+
|  [Comparison Summary]           |
|  - Diff count, sync status      |
+----------------------------------+
```

---

## Components to Create

### 1. Main Component
**`src/components/admin/ApiComparisonDashboard.tsx`**

A comprehensive comparison dashboard with:
- Tabbed interface for switching between data types (Strains, Clients, Orders)
- Side-by-side panels showing production vs staging data
- Loading states for each environment independently
- Error handling with clear environment indicators
- Summary section showing differences/discrepancies

### 2. Supporting Types
**`src/types/comparison.ts`** (inline in component)

```typescript
interface ComparisonData {
  production: { data: unknown; loading: boolean; error: string | null };
  staging: { data: unknown; loading: boolean; error: string | null };
}

interface StrainComparison {
  id: string;
  name: string;
  prodPrice?: number;
  stagingPrice?: number;
  prodAvailable?: boolean;
  stagingAvailable?: boolean;
  hasDiff: boolean;
}
```

---

## Data Fetching Strategy

### Edge Function Approach
Create a new edge function **`drgreen-comparison`** that:
1. Accepts an `environment` parameter (`production` | `staging`)
2. Returns normalized data structure for comparison
3. Handles authentication and signing for each environment

Alternatively, reuse existing **`drgreen-api-tests`** edge function by adding a `comparison` action that fetches real data from both environments.

### Frontend Hook
Add a custom hook **`useApiComparison`** in `src/hooks/useApiComparison.ts`:

```typescript
function useApiComparison() {
  const fetchFromEnvironment = async (env: 'production' | 'staging', dataType: string) => {
    // Call edge function with environment parameter
    // Return normalized data
  };
  
  const fetchComparison = async (dataType: 'strains' | 'clients' | 'orders') => {
    const [prodResult, stagingResult] = await Promise.all([
      fetchFromEnvironment('production', dataType),
      fetchFromEnvironment('staging', dataType),
    ]);
    return { production: prodResult, staging: stagingResult };
  };
  
  return { fetchComparison };
}
```

---

## UI Components Breakdown

### Header Section
- Title: "API Comparison Dashboard"
- Description: "Compare production and staging environments side-by-side"
- Refresh button to reload both environments
- Last updated timestamp

### Tab Navigation
| Tab | Data Fetched | Key Metrics |
|-----|--------------|-------------|
| **Strains** | `get-strains` (countryCode: ZAF) | Name, THC/CBD, Price, Availability |
| **Clients** | `dapp-clients` (take: 10) | ID, Name, Email, KYC Status |
| **Orders** | `dapp-orders` (take: 10) | ID, Status, Amount, Date |

### Comparison Panels
Each panel shows:
- Environment badge (green for Production, orange for Staging)
- API endpoint URL
- Response time
- Data count
- Scrollable data table

### Difference Indicators
- **Green**: Values match
- **Red**: Values differ
- **Yellow**: Missing in one environment
- **Gray**: Field not comparable

### Summary Footer
- Total items in Production vs Staging
- Number of differences found
- Sync status recommendation

---

## Edge Function Updates

### Option A: New Edge Function
Create **`supabase/functions/drgreen-comparison/index.ts`**:

```typescript
// Accepts: { environment, dataType, countryCode? }
// Returns: { data, meta: { responseTime, itemCount, apiUrl } }

serve(async (req) => {
  const { environment, dataType, countryCode } = await req.json();
  
  const config = ENV_CONFIG[environment];
  const apiKey = Deno.env.get(config.apiKeyEnv);
  
  // Fetch data based on dataType
  switch (dataType) {
    case 'strains':
      return fetchStrains(config, countryCode);
    case 'clients':
      return fetchClients(config);
    case 'orders':
      return fetchOrders(config);
  }
});
```

### Option B: Extend drgreen-proxy
Add a comparison mode that automatically handles staging credentials:

```typescript
// In drgreen-proxy, add staging support:
if (action === 'staging-get-strains') {
  const stagingConfig = getEnvConfig('staging');
  // Use staging credentials
}
```

---

## Implementation Files

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/ApiComparisonDashboard.tsx` | **Create** | Main comparison UI component |
| `src/hooks/useApiComparison.ts` | **Create** | Custom hook for fetching comparison data |
| `supabase/functions/drgreen-comparison/index.ts` | **Create** | Edge function for environment-specific data fetching |
| `src/pages/AdminDashboard.tsx` | **Update** | Add ApiComparisonDashboard component |

---

## UI Mockup

```text
┌─────────────────────────────────────────────────────────────────┐
│ 🔄 API Comparison Dashboard                    [↻ Refresh All] │
│ Compare production and staging environments                     │
├─────────────────────────────────────────────────────────────────┤
│ [ Strains ]  [ Clients ]  [ Orders ]                            │
├────────────────────────────┬────────────────────────────────────┤
│ 🟢 PRODUCTION              │ 🟠 STAGING (Railway)               │
│ api.drgreennft.com         │ budstack-backend-main-dev...       │
│ Response: 234ms            │ Response: 456ms                    │
├────────────────────────────┼────────────────────────────────────┤
│ ┌──────────────────────┐   │ ┌──────────────────────┐           │
│ │ Blue Dream    R1200  │   │ │ Blue Dream    R1200  │ ✓        │
│ │ OG Kush       R1450  │   │ │ OG Kush       R1500  │ ⚠ Diff   │
│ │ Sour Diesel   R1100  │   │ │ Sour Diesel   R1100  │ ✓        │
│ │ ... (12 more)        │   │ │ ... (11 more)        │ ⚠ Count  │
│ └──────────────────────┘   │ └──────────────────────┘           │
├────────────────────────────┴────────────────────────────────────┤
│ 📊 Summary: 15 items (Prod) vs 14 items (Staging) • 2 diffs     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Considerations

### CORS & Authentication
- Both environments require cryptographic signing
- Staging uses `DRGREEN_STAGING_*` secrets (already configured)
- Edge function handles all signing server-side

### Rate Limiting
- Implement debounce on refresh (min 5 seconds between refreshes)
- Show loading state per environment to indicate parallel fetching

### Error Handling
- If one environment fails, still show the other
- Clear error messages indicating which environment failed
- Retry button per environment

### Caching
- Optional: Cache comparison results for 60 seconds
- Show "stale" indicator when viewing cached data

---

## Integration with Admin Dashboard

Add the comparison dashboard as a new section in `AdminDashboard.tsx`:

```typescript
// In AdminDashboard.tsx
import { ApiComparisonDashboard } from "@/components/admin/ApiComparisonDashboard";

// After ApiTestRunner section:
<ApiComparisonDashboard />
```

---

## Comparison Logic

### Strains Matching
Match by `id` or `sku`:
- Compare: `name`, `thcContent`, `cbdContent`, `retailPrice`, `availability`
- Flag: Price differences > 5%, missing strains

### Clients Matching
Match by `email`:
- Compare: `firstName`, `lastName`, `isKYCVerified`, `adminApproval`
- Flag: KYC status differences

### Orders Matching
Match by `id`:
- Compare: `status`, `paymentStatus`, `totalAmount`
- Flag: Status mismatches

---

## Implementation Order

1. Create `useApiComparison` hook with basic fetch logic
2. Create `drgreen-comparison` edge function
3. Build `ApiComparisonDashboard` component with Strains tab
4. Add Clients and Orders tabs
5. Implement difference detection and highlighting
6. Add to AdminDashboard.tsx
7. Test with real data from both environments

---

## Dependencies Used
- Existing: `@radix-ui/react-tabs`, `lucide-react`, `framer-motion`
- Existing: UI components (Card, Badge, Table, Tabs, ScrollArea)
- Existing: `useDrGreenApi` pattern for API calls
