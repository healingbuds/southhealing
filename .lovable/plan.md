
# Plan: Configure Real User Accounts and Dr. Green API Sync

## Current Situation

The remixed project has:
- Empty database (no users)
- A seed function with mock test accounts that won't sync with the live Dr. Green API
- No accounts for Scott or Kayliegh in Supabase (though they exist in Dr. Green)

## What Needs to Happen

### Phase 1: Update Seed Function for Real Accounts

Remove all mock test accounts EXCEPT admin, and add Scott and Kayliegh as real accounts that will properly sync with the Dr. Green API.

**Changes to `seed-test-users` edge function:**

1. Remove these mock accounts:
   - `new@healingbuds.test`
   - `pending@healingbuds.test`
   - `kycdone@healingbuds.test`
   - `patient@healingbuds.test`
   - `rejected@healingbuds.test`

2. Keep only:
   - `admin@healingbuds.test` (for admin access testing)

3. Add real accounts for Scott and Kayliegh:
   - Will need their actual emails from the Dr. Green API
   - Will set `createClient: false` initially so the app can fetch their real client data from Dr. Green API on first sync
   - Passwords can be set temporarily (they can reset via email)

### Phase 2: Run the Seed Function

After updating the seed function:
1. Deploy the updated edge function
2. Call the seed function to create the accounts

### Phase 3: Link Accounts to Dr. Green

After accounts are created:
1. Users log in with their credentials
2. The `syncVerificationFromDrGreen` function will:
   - Fetch their client record from Dr. Green API by email
   - Create/update the local `drgreen_clients` record with correct status
   - Their `isEligible` state will reflect the live Dr. Green approval

### Phase 4: Update Auth.tsx

Remove the test account UI dropdown entirely OR update it to only show the admin test account.

---

## Technical Details

### Seed Function Changes

```typescript
const TEST_USERS = [
  // Only keep admin for testing admin features
  {
    email: "admin@healingbuds.test",
    password: "Admin123!",
    fullName: "Admin User",
    createClient: false, // Will sync from Dr. Green
    role: "admin",
  },
  // Add Scott's real account
  {
    email: "scott@[actual-email]", // Need actual email
    password: "TempPassword123!", // Temporary, can reset
    fullName: "Scott [Lastname]",
    createClient: false, // Let app sync from Dr. Green
    role: null,
  },
  // Add Kayliegh's real account
  {
    email: "kayliegh@[actual-email]", // Need actual email
    password: "TempPassword123!", // Temporary, can reset
    fullName: "Kayliegh [Lastname]",
    createClient: false, // Let app sync from Dr. Green
    role: null,
  },
];
```

### Auth Flow for Linked Accounts

When Scott or Kayliegh log in:

```
1. Supabase Auth validates credentials
2. App calls fetchClient() → No local drgreen_clients record
3. App shows "Registration needed" or auto-triggers sync
4. Sync queries Dr. Green API: GET /dapp/clients?search=email
5. If found: Creates local drgreen_clients record with real client ID
6. isEligible becomes true if adminApproval === "VERIFIED"
```

### Information Needed From You

To complete this implementation, I need:

1. **Scott's email address** (as registered in Dr. Green)
2. **Kayliegh's email address** (as registered in Dr. Green)
3. **Temporary passwords** for both (or confirm if they should reset via email)

---

## Security Note

Real user credentials should NEVER be stored in code. The seed function will:
- Create Supabase auth accounts with temporary passwords
- NOT create mock drgreen_clients records
- Let the actual Dr. Green API sync handle client status

This ensures the Dr. Green API remains the single source of truth for client eligibility.
