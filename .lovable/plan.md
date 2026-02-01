

# Plan: Reassign Dr. Green Client Records

## Current State

| User | Supabase User ID | Current Dr. Green Link |
|------|------------------|------------------------|
| Admin User | `6fc36e5c-92c5-43d4-a162-3d6385190590` | None |
| Scott Hickling | `f9ceca52-abd4-4da7-a747-e8fa1e971867` | `fb70d208...` (Healing Buds) |
| Kayliegh | `7b4c7b03-7630-46e3-9337-4c56cad600c8` | `47542db8...` ✓ |

## Required Changes

### Step 1: Update Scott's record to use his personal client ID
```sql
UPDATE public.drgreen_clients 
SET 
  drgreen_client_id = 'dfd81e64-c17d-4a1b-8111-cdf49f879e82',
  email = 'scott.k1@outlook.com',
  full_name = 'Scott Hickling'
WHERE user_id = 'f9ceca52-abd4-4da7-a747-e8fa1e971867';
```

### Step 2: Insert new record for Admin User with Healing Buds client
```sql
INSERT INTO public.drgreen_clients (
  user_id,
  drgreen_client_id,
  email,
  full_name,
  country_code,
  is_kyc_verified,
  admin_approval
) VALUES (
  '6fc36e5c-92c5-43d4-a162-3d6385190590',
  'fb70d208-8f12-4444-9b1b-e92bd68f675f',
  'scott@healingbuds.global',
  'Healing Buds',
  'ZA',
  true,
  'VERIFIED'
);
```

## Final State After Changes

| User | Supabase User ID | Dr. Green Client ID | Email |
|------|------------------|---------------------|-------|
| Admin User | `6fc36e5c...` | `fb70d208...` | scott@healingbuds.global |
| Scott Hickling | `f9ceca52...` | `dfd81e64...` | scott.k1@outlook.com |
| Kayliegh | `7b4c7b03...` | `47542db8...` | kayliegh.sm@gmail.com |

## Database Operations

| Operation | Table | Description |
|-----------|-------|-------------|
| UPDATE | `drgreen_clients` | Change Scott's link to his personal client ID |
| INSERT | `drgreen_clients` | Add Healing Buds client to Admin User |

## No Code Changes Required
This is a data-only fix.

