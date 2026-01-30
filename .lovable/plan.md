
Goal
- Make the Dr. Green integration predictable and “single source of truth”:
  - At sign-in / sign-up: automatically link the logged-in user to their Dr. Green client (by the user’s authenticated email) and pull live KYC + adminApproval into the local mapping table.
  - Registration flow: do not create duplicates; if a client already exists in Dr. Green, link instead of re-registering.
  - Remove the outdated “Test Accounts (Demo Access)” dropdown from Auth (keep only Admin demo if desired).

What’s currently going wrong (from code review)
1) Auth page still renders a hardcoded “Test Accounts (Demo Access)” dropdown
- src/pages/Auth.tsx contains buttons that auto-fill emails like new@healingbuds.test, pending@..., etc.
- Those accounts are now removed, but the UI still advertises them, which is misleading and breaks trust.

2) Live verification does not “self-heal” for real existing Dr. Green clients
- ShopContext fetches eligibility ONLY from the local drgreen_clients row for the logged-in user (drgreen_clients where user_id = auth.uid()).
- If that row doesn’t exist yet (common for “real users that already exist in Dr. Green”), the app has no way to discover the correct drgreen_client_id and therefore cannot sync status.
- Current syncVerificationFromDrGreen() requires drGreenClient.drgreen_client_id; if drGreenClient is null, sync cannot run.

3) ClientOnboarding can create “local-*” placeholder client IDs
- ClientOnboarding sets clientId = `local-${Date.now()}` by default and only replaces it if the API call succeeds.
- If the API call fails, it still upserts drgreen_clients with a local-* id, then eligibility sync is explicitly skipped later (ShopContext checks local-* prefix and refuses to sync).
- That makes the process feel “messy/ambiguous”: a user “registered” but the system can never reconcile them automatically.

Non-negotiable compliance requirements satisfied by the fix
- Browser must never call Dr. Green directly. We will only call via the backend proxy (drgreen-proxy).
- Server-side signing only (already true).
- Eligibility enforcement remains: only isKYCVerified === true AND adminApproval === "VERIFIED" unlocks cart/checkout.

Implementation design (high level)
A) Add a safe “self-lookup” action to drgreen-proxy
- New proxy action: “get-client-by-auth-email” (name can vary, but concept is: no arbitrary email input).
- It MUST:
  - Require a logged-in user (Authorization Bearer token present).
  - Ignore any provided email in the request body.
  - Use the authenticated user’s email from the token to query Dr. Green:
    - GET /dapp/clients?search=<user.email>&searchBy=email&take=1&orderBy=desc
  - Return only what the app needs to link:
    - clientId, isKYCVerified, adminApproval, kycLink, email
- This avoids privacy leaks (users can’t probe other emails).

Files to change:
- supabase/functions/drgreen-proxy/index.ts
  - Add new action handler in the switch(action) section.
  - Add the action name to the appropriate allowlist:
    - Probably AUTH_ONLY_ACTIONS (auth required, no admin role).
  - Use query signing (drGreenRequestQuery) consistent with /dapp/clients list endpoints.

B) Automatically link + refresh Dr. Green status on login (and on app boot)
- Update ShopContext so that after login:
  - If drgreen_clients row exists: current behavior continues (fetchClient + optional syncVerificationFromDrGreen).
  - If drgreen_clients row does NOT exist:
    1) Call drgreen-proxy action get-client-by-auth-email
    2) If a Dr. Green client is found:
       - Upsert drgreen_clients with:
         - user_id = auth user id
         - drgreen_client_id = returned clientId
         - is_kyc_verified, admin_approval, kyc_link
         - email (optional field in table) for observability
       - Then fetchClient() again to populate state
    3) If no client found:
       - keep drGreenClient null → user is correctly treated as unregistered and routed to /shop/register
- Result: Scott and Kayliegh will log in and immediately become “Verified” in the UI because we will pull their approved status from Dr. Green.

Files to change:
- src/context/ShopContext.tsx
  - Add a new internal function: linkClientFromDrGreenByAuthEmail()
  - Call it inside the auth state change effect (after fetchClient detects null), and/or inside fetchClient when no local record exists.
  - Keep all eligibility logic unchanged (still based on the local mapping row that was populated from Dr. Green).

C) Make ClientOnboarding deterministic (no “local-*” dead-end)
We’ll implement a clean, explicit decision tree:

1) On “submit registration”:
   - First, call get-client-by-auth-email.
   - If Dr. Green already has a client for this email:
     - Do NOT call create-client-legacy.
     - Just upsert drgreen_clients using the existing clientId and status and continue to “Next steps / KYC link” UI.
2) If no Dr. Green client exists:
   - Call create-client-legacy with the payload.
   - If success:
     - Upsert drgreen_clients with returned clientId and kycLink.
   - If failure:
     - Do NOT store local-* drgreen_client_id.
     - Show a clear blocking error and a “Retry” button (and optionally “Contact support”).
     - Rationale: local-* prevents syncing forever and causes ambiguity.

Files to change:
- src/components/shop/ClientOnboarding.tsx
  - Replace the “local-*” fallback path with:
    - “hard fail + retry” (preferred for compliance-critical onboarding)
  - Add pre-check for existing Dr. Green client by auth email before creating a new one.

D) Remove the test accounts dropdown from Auth.tsx (and prevent regressions)
- Remove the entire <details> block currently labeled “Test Accounts (Demo Access)”.
- Optional: keep ONLY an Admin autofill button, but behind a strict guard (so it cannot accidentally ship or confuse operators), e.g.:
  - Only show if hostname includes lovable.app OR a query flag ?demo=1
  - And only include admin@healingbuds.test.
- Given your instruction “only test account is admin”: we’ll keep at most that single admin autofill, or remove all autofills completely (recommended for production trust).

Files to change:
- src/pages/Auth.tsx

E) Verification refresh behavior (make it feel seamless)
- Keep the existing “Refresh Status” button.
- Add one automatic refresh trigger:
  - On dashboard/status mount, call syncVerificationFromDrGreen once immediately (not just every 30s when not verified).
  - This reduces “why isn’t it updated?” moments.

Files to change:
- src/pages/DashboardStatus.tsx

Testing plan (must pass before considering this fixed)
1) Real verified user (Scott)
- Log in as scott.k1@outlook.com
- Expected:
  - ShopContext sees no local drgreen_clients row → calls get-client-by-auth-email → upserts mapping → drGreenClient populated
  - isEligible becomes true (KYC verified + adminApproval VERIFIED)
  - Redirect to /dashboard then /shop (as your redirect logic dictates)

2) Real verified user (Kayliegh)
- Same as above.

3) Brand new user (no Dr. Green client yet)
- Sign up → confirm email → sign in → attempt /shop
- Expected:
  - No Dr. Green client found → must complete /shop/register
  - Onboarding submission:
    - If Dr. Green API succeeds: client created, KYC link stored and shown
    - If API fails: clear blocking error + retry, no local-* dead record created

4) Ineligible / pending user
- Ensure cart and checkout remain blocked unless (is_kyc_verified === true AND admin_approval === "VERIFIED")

5) Security validation
- Confirm the new proxy action cannot be used to look up arbitrary emails:
  - Request body email is ignored; server always uses token user.email.

Rollout notes
- No database schema changes are required.
- This keeps Dr. Green as the single source of truth for verification; local drgreen_clients remains a mapping/cache for UI gating, updated from Dr. Green.

User decisions needed (small, but important)
- For Auth.tsx demo UI:
  1) Remove all autofill UI completely (recommended), OR
  2) Keep only “Admin demo autofill” but only in preview/dev.

I will implement with option (1) by default unless you explicitly want (2).
