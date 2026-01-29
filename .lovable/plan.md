
# Add Confirmation Dialog for Client Approve/Reject Actions

## Overview

Add an AlertDialog confirmation step before approving or rejecting clients to prevent accidental actions. This is a critical safety feature for a medical cannabis platform where client verification has compliance implications.

---

## Current Behavior

```text
User clicks [Approve] -> handleApprove() executes immediately -> API call made
User clicks [Reject]  -> handleReject() executes immediately  -> API call made
```

## New Behavior

```text
User clicks [Approve] -> Confirmation Dialog opens -> User confirms -> handleApprove() -> API call
User clicks [Reject]  -> Confirmation Dialog opens -> User confirms -> handleReject()  -> API call
```

---

## UI Design

### Approve Confirmation Dialog

```text
+----------------------------------------------------------+
|                                                          |
|   [Shield Icon] Approve Client?                          |
|                                                          |
|   Are you sure you want to approve                       |
|   Kayliegh Moutinho (kayliegh.sm@gmail.com)?             |
|                                                          |
|   This will grant them access to purchase medical        |
|   cannabis products through the platform.                |
|                                                          |
|                          [Cancel]  [Yes, Approve Client] |
+----------------------------------------------------------+
```

### Reject Confirmation Dialog

```text
+----------------------------------------------------------+
|                                                          |
|   [Alert Icon] Reject Client?                            |
|                                                          |
|   Are you sure you want to reject                        |
|   Kayliegh Moutinho (kayliegh.sm@gmail.com)?             |
|                                                          |
|   This will prevent them from purchasing products        |
|   until they are re-approved.                            |
|                                                          |
|                          [Cancel]  [Yes, Reject Client]  |
+----------------------------------------------------------+
```

---

## Technical Implementation

### New State Variables

```typescript
// Dialog state
const [confirmDialog, setConfirmDialog] = useState<{
  open: boolean;
  action: 'approve' | 'reject' | null;
  client: DrGreenClient | null;
}>({
  open: false,
  action: null,
  client: null,
});
```

### New Functions

```typescript
// Open confirmation dialog
const openConfirmDialog = (client: DrGreenClient, action: 'approve' | 'reject') => {
  setConfirmDialog({ open: true, action, client });
};

// Close confirmation dialog
const closeConfirmDialog = () => {
  setConfirmDialog({ open: false, action: null, client: null });
};

// Execute the confirmed action
const executeConfirmedAction = async () => {
  if (!confirmDialog.client || !confirmDialog.action) return;
  
  const { client, action } = confirmDialog;
  const clientName = `${client.firstName} ${client.lastName}`;
  
  closeConfirmDialog();
  
  if (action === 'approve') {
    await handleApprove(client.id, clientName);
  } else {
    await handleReject(client.id, clientName);
  }
};
```

### Button Changes

Replace direct `onClick` handlers with dialog openers:

```typescript
// Before
onClick={() => handleApprove(client.id, `${client.firstName} ${client.lastName}`)}

// After
onClick={() => openConfirmDialog(client, 'approve')}
```

---

## Component Dependencies

| Component | Source | Already Installed |
|-----------|--------|-------------------|
| `AlertDialog` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogAction` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogCancel` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogContent` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogDescription` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogFooter` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogHeader` | `@/components/ui/alert-dialog` | Yes |
| `AlertDialogTitle` | `@/components/ui/alert-dialog` | Yes |

---

## Changes Summary

### File to Modify

`src/components/admin/AdminClientManager.tsx`

### Modifications

1. **Add import** for AlertDialog components from `@/components/ui/alert-dialog`

2. **Add state** for tracking which client and action is being confirmed

3. **Add helper functions** for opening/closing dialog and executing confirmed action

4. **Replace button onClick handlers** to open confirmation dialog instead of direct execution

5. **Add AlertDialog component** at the end of the JSX return with:
   - Dynamic title based on action (Approve/Reject)
   - Client name and email in description
   - Appropriate warning message about the action's consequences
   - Cancel button (closes dialog, no action)
   - Confirm button (styled green for approve, red for reject)

---

## Action Button Styling

| Action | Confirm Button Style |
|--------|---------------------|
| Approve | `bg-green-600 hover:bg-green-700 text-white` |
| Reject | `bg-red-600 hover:bg-red-700 text-white` |

---

## Accessibility Considerations

- AlertDialog traps focus automatically
- Escape key closes the dialog
- Screen reader announces dialog title and description
- Cancel action is keyboard accessible
