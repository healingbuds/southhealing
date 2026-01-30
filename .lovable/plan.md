
# COMPLETED: Dr. Green Client Approval - Architecture Correction

## Summary

The implementation has been updated to reflect that **client approval/rejection cannot be done via the Dr. Green API**. The only documented client PATCH operations are `/activate` and `/deactivate` (for isActive status), not for `adminApproval`.

---

## Changes Made

### 1. Edge Function (`supabase/functions/drgreen-proxy/index.ts`)

- **Deprecated** the `dapp-verify-client` action - it now throws a clear error explaining that approval must be done in the Dr. Green DApp admin portal
- **Added** new `sync-client-status` action that fetches live client data from `GET /dapp/clients/{clientId}`

### 2. Admin Client Manager (`src/components/admin/AdminClientManager.tsx`)

- **Removed** Approve/Reject buttons (they never worked via API)
- **Removed** confirmation dialog for approve/reject actions
- **Added** "Pending Dr. Green Review" badge with tooltip explanation
- **Added** "Sync" button to refresh individual client status from live API
- **Added** "Dr. Green" button to open the external admin portal
- UI now correctly shows:
  - PENDING → Yellow badge + Sync button + External link
  - VERIFIED → Green "Approved" badge
  - REJECTED → Red badge + Sync button

### 3. API Hook (`src/hooks/useDrGreenApi.ts`)

- **Deprecated** `verifyDappClient` function with a console warning
- **Added** `syncClientStatus` function to fetch live client data

---

## Architecture (Final)

```
Dr. Green DApp Admin Portal
├── Approve/Reject clients (ONLY place to change adminApproval)
└── Sends webhook events → drgreen-webhook → Updates local DB

Healing Buds Admin Panel
├── View client list (from live API)
├── Sync Status button → GET /dapp/clients/{id} → Refresh adminApproval
└── Link to Dr. Green DApp for approval actions
```

---

## For Kayliegh's Status

Since Kayliegh was approved in the Dr. Green DApp:
1. Click "Sync" next to her name in the Admin panel
2. Her status should update to "VERIFIED" / "Approved" badge
3. The counts at the top (Verified tab) should increment

---

## API Endpoints Used

| Action | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| Fetch clients | `/dapp/clients` | GET | List all clients |
| Sync status | `/dapp/clients/{id}` | GET | Fetch individual client (with current adminApproval) |
| Activate | `/dapp/clients/{id}/activate` | PATCH | Set isActive=true |
| Deactivate | `/dapp/clients/{id}/deactivate` | PATCH | Set isActive=false |

**NOT AVAILABLE:**
- ❌ `/dapp/clients/{id}/approve` - Does not exist
- ❌ `/dapp/clients/{id}/reject` - Does not exist
- ❌ `PATCH /dapp/clients/{id}` with `{ adminApproval: "VERIFIED" }` - Not documented
