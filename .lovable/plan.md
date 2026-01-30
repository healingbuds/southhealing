
# Fix: Live Dr. Green API Integration for Verified Status Display

## Problem Summary
The dashboard shows "Account Pending Approval" for Scott even though you say he's approved in Dr. Green. The investigation reveals:

1. **API lookup is working** - The proxy successfully queries Dr. Green and finds 6 clients
2. **Email mismatch** - Scott's email `scott.k1@outlook.com` does NOT match any of those 6 clients in the Dr. Green system
3. **Data not flowing back** - Even if a match was found, the status update and user feedback aren't clear enough
4. **Kayliegh completed registration** - She went through the full onboarding and should be properly linked

## Root Causes
1. **Scott has no Dr. Green profile under `scott.k1@outlook.com`** - He may be registered under a different email in Dr. Green, or never completed registration through the proper flow
2. **API response logging insufficient** - We don't see what emails exist in the 6 clients returned, making debugging hard
3. **No clear user feedback** - When auto-discovery fails, the user isn't told why or given clear next steps
4. **Local drgreen_clients table is empty** - The query returned no rows, confirming neither Scott nor Kayliegh have local mappings yet

## Implementation Plan

### A) Enhanced API Debugging (Edge Function)
Add detailed logging to show what emails exist in the Dr. Green response (masked for privacy).

**File**: `supabase/functions/drgreen-proxy/index.ts`
- Log the first 3 characters of each client email found (e.g., "sco***", "kay***")
- Log total clients in response and any with email fields present
- This helps diagnose whether the API is returning the right clients

### B) Better Error Handling & User Messaging (ShopContext)
When auto-discovery fails, provide clear feedback to the user.

**File**: `src/context/ShopContext.tsx`
- Add toast notifications when auto-discovery runs
- Show "No existing profile found - please complete registration" when lookup returns no match
- Show "Profile linked successfully!" when a match is found

### C) Immediate Status Sync on Dashboard Load
Force a fresh check from Dr. Green when viewing status page.

**File**: `src/pages/DashboardStatus.tsx`
- Call `linkClientFromDrGreenByAuthEmail` directly if no local client exists (currently only done via ShopContext)
- Show a clear message: "Checking Dr. Green records..." during lookup
- Display the API result to the user

### D) Pagination Support for Large Client Lists
If there are more than 100 clients in Dr. Green, the current lookup may miss users on later pages.

**File**: `supabase/functions/drgreen-proxy/index.ts`
- Implement pagination: fetch up to 3 pages (300 clients) before giving up
- Log which page the match was found on for debugging

### E) Admin Dashboard: Manual Email Lookup
Allow admins to look up a client by email to verify they exist in Dr. Green.

**File**: `src/components/admin/AdminClientManager.tsx`
- Add a "Lookup by Email" action that queries the API
- Show the full client record if found (for admin debugging)

## Technical Details

### Edge Function Changes (`drgreen-proxy/index.ts`)

```typescript
// Enhanced logging for client lookup
const emailPrefixes = clients.map((c: any) => 
  c.email ? c.email.slice(0, 3) + '***' : 'no-email'
);
logInfo("Client emails in response", { 
  clientCount: clients.length, 
  emailPrefixes: emailPrefixes.slice(0, 10) // Show first 10
});

// Multi-page lookup
for (let page = 1; page <= 3; page++) {
  const queryParams = { take: 100, page, orderBy: 'desc' };
  const response = await drGreenRequestQuery("/dapp/clients", queryParams);
  // ... check for match in this page
  if (matchingClient) break;
  if (clients.length < 100) break; // No more pages
}
```

### ShopContext Changes (`src/context/ShopContext.tsx`)

```typescript
// Add user-facing feedback
const linkClientFromDrGreenByAuthEmail = useCallback(async (userId: string): Promise<boolean> => {
  try {
    toast({ title: 'Checking records...', description: 'Looking up your profile' });
    
    const { data, error } = await supabase.functions.invoke('drgreen-proxy', {
      body: { action: 'get-client-by-auth-email' },
    });
    
    if (data?.found && data?.clientId) {
      toast({ 
        title: 'Profile Found!', 
        description: `Status: ${data.adminApproval}`,
        variant: data.adminApproval === 'VERIFIED' ? 'default' : 'default'
      });
      // ... upsert logic
      return true;
    } else {
      toast({ 
        title: 'No Profile Found', 
        description: 'Please complete registration to access the shop',
        variant: 'default'
      });
      return false;
    }
  } catch (err) {
    toast({ title: 'Lookup Failed', description: 'Please try again', variant: 'destructive' });
    return false;
  }
}, [toast]);
```

### Dashboard Status Changes (`src/pages/DashboardStatus.tsx`)

```typescript
// Add direct lookup button and status display
const [lookupResult, setLookupResult] = useState<string | null>(null);

const handleManualLookup = async () => {
  setLookupResult('Checking Dr. Green records...');
  const { data } = await supabase.functions.invoke('drgreen-proxy', {
    body: { action: 'get-client-by-auth-email' },
  });
  
  if (data?.found) {
    setLookupResult(`Found! Status: ${data.adminApproval}, KYC: ${data.isKYCVerified ? 'Yes' : 'No'}`);
  } else {
    setLookupResult('No profile found under your email address.');
  }
};
```

## User Experience After Fix

1. **Scott logs in** → Auto-discovery runs → Toast: "No Profile Found - please complete registration"
2. **Scott goes to /shop/register** → Completes onboarding → Dr. Green client created → Returns with KYC link
3. **After KYC complete** → Scott refreshes → Auto-discovery finds his new profile → Status updates to verified
4. **Kayliegh logs in** → Auto-discovery runs → Toast: "Profile Found! Status: VERIFIED" → Redirected to shop

## What If Scott Already Has a Dr. Green Profile?

If Scott registered in the Dr. Green DApp portal directly (not through Healing Buds), he needs to:
1. Confirm what email he used in Dr. Green
2. Either:
   - Update his Dr. Green profile email to match `scott.k1@outlook.com`, OR
   - Sign up for Healing Buds with the email that matches his Dr. Green profile

## Files to Modify

1. `supabase/functions/drgreen-proxy/index.ts` - Enhanced logging + pagination
2. `src/context/ShopContext.tsx` - Toast notifications for auto-discovery
3. `src/pages/DashboardStatus.tsx` - Manual lookup button + clear status display
4. `src/components/admin/AdminClientManager.tsx` - Admin email lookup tool

## Testing Plan

1. Log in as `scott.k1@outlook.com` → Should see toast "No Profile Found"
2. View `/dashboard/status` → Should see clear message and option to register
3. Complete registration → Dr. Green client created → Return to status page
4. Refresh status → Should now show verified (if approved in Dr. Green)
5. Log in as Kayliegh → Should auto-discover and show verified status
