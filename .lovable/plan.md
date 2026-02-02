

## Goal
Update the Quick Login dropdown to use the correct admin password `H34l1ng@buds2025!`

## What just happened
The admin user password was successfully reset via the backend function:
- **Email**: `admin@healingbuds.test`
- **Password**: `H34l1ng@buds2025!`
- **Email Verified**: ✅ Yes

## Change Required

### File: `src/pages/Auth.tsx` (Line 320)

Update the password from `Healing2025!` to `H34l1ng@buds2025!`:

```typescript
<DropdownMenuItem
  onClick={() => {
    setEmail("admin@healingbuds.test");
    setPassword("H34l1ng@buds2025!");  // Updated password
  }}
  className="cursor-pointer"
>
  <Shield className="w-4 h-4 mr-2 text-primary" />
  Admin (Test)
</DropdownMenuItem>
```

## Testing
After this change:
1. Click **Quick Login (Dev)** → **Admin (Test)**
2. Click **Sign In**
3. Should redirect to `/admin` successfully

