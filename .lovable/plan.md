
# Plan: Add Railway Environment to drgreen-proxy

## Objective
Add a third `railway` environment to `drgreen-proxy` to match the configuration in `drgreen-comparison`, enabling switching between all three API environments.

## Current State

| Environment | Status in drgreen-proxy | Status in drgreen-comparison |
|-------------|-------------------------|------------------------------|
| production | ✅ Configured | ✅ Configured |
| staging | ✅ Configured | ✅ Configured |
| railway | ❌ Missing | ✅ Configured |

## Changes Required

### File: `supabase/functions/drgreen-proxy/index.ts`

#### 1. Add Railway Environment to ENV_CONFIG (after line 364)

Add the railway configuration matching `drgreen-comparison`:

```typescript
const ENV_CONFIG: Record<string, EnvConfig> = {
  production: {
    apiUrl: 'https://api.drgreennft.com/api/v1',
    apiKeyEnv: 'DRGREEN_API_KEY',
    privateKeyEnv: 'DRGREEN_PRIVATE_KEY',
    name: 'Production',
  },
  staging: {
    apiUrl: getStagingApiUrl(),
    apiKeyEnv: 'DRGREEN_STAGING_API_KEY',
    privateKeyEnv: 'DRGREEN_STAGING_PRIVATE_KEY',
    name: 'Staging (Official)',
  },
  railway: {
    apiUrl: 'https://budstack-backend-main-development.up.railway.app/api/v1',
    apiKeyEnv: 'DRGREEN_STAGING_API_KEY',
    privateKeyEnv: 'DRGREEN_STAGING_PRIVATE_KEY',
    name: 'Railway (Dev)',
  },
};
```

#### 2. Update `test-staging` Action

Modify the existing `test-staging` action to test all three environments and report connectivity status for each.

## Configuration Details

| Environment | API URL | API Key Source | Private Key Source |
|-------------|---------|----------------|-------------------|
| production | `https://api.drgreennft.com/api/v1` | `DRGREEN_API_KEY` | `DRGREEN_PRIVATE_KEY` |
| staging | `https://stage-api.drgreennft.com/api/v1` | `DRGREEN_STAGING_API_KEY` | `DRGREEN_STAGING_PRIVATE_KEY` |
| railway | `https://budstack-backend-main-development.up.railway.app/api/v1` | `DRGREEN_STAGING_API_KEY` | `DRGREEN_STAGING_PRIVATE_KEY` |

**Note**: Railway uses the same credentials as staging (both are development environments).

## Usage After Implementation

### Switch environment per request:
```json
{"action": "get-strains", "countryCode": "ZAF", "env": "production"}
{"action": "get-strains", "countryCode": "ZAF", "env": "staging"}
{"action": "get-strains", "countryCode": "ZAF", "env": "railway"}
```

### Test all environments:
```json
{"action": "test-staging"}
```

## Testing Plan
1. Deploy updated edge function
2. Run `test-staging` action to verify all three environments
3. Test `get-strains` with each `env` value
4. Verify `/dapp/clients` endpoints on Railway (may have different permissions)

## File to Modify

| File | Changes |
|------|---------|
| `supabase/functions/drgreen-proxy/index.ts` | Add railway to ENV_CONFIG, update test-staging action |
| `.lovable/plan.md` | Update documentation with three-environment support |
