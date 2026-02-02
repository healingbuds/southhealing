
# Plan: Add Staging Environment Support to drgreen-proxy

## ✅ COMPLETED

## Problem Summary
The `drgreen-proxy` edge function currently only uses production credentials (`DRGREEN_API_KEY` and `DRGREEN_PRIVATE_KEY`) which are returning 401 errors. Staging credentials are already configured (`DRGREEN_STAGING_API_KEY`, `DRGREEN_STAGING_PRIVATE_KEY`, `DRGREEN_STAGING_API_URL`) but aren't being used.

## Solution Implemented
Added environment switching capability to `drgreen-proxy` following the same pattern used in `drgreen-comparison`, allowing requests to target either production or staging APIs.

## Changes Made

### 1. Added Environment Configuration Object
- Added `EnvConfig` interface and `ENV_CONFIG` record with production and staging configurations
- Added `getStagingApiUrl()` helper to validate staging URL format
- Added `getEnvironment()` function for environment selection
- Added `getEnvCredentials()` function to retrieve credentials by environment

### 2. Updated Request Functions
- `drGreenRequestBody()` - Now accepts optional `envConfig` parameter
- `drGreenRequestGet()` - Now accepts optional `envConfig` parameter
- `drGreenRequestQuery()` - Now accepts optional `envConfig` parameter
- `drGreenRequest()` - Now accepts optional `envConfig` parameter

### 3. Added test-staging Action
New public action to test staging credentials:
```json
{ "action": "test-staging" }
```

## Test Results

### Staging Environment
- ✅ `GET /strains` - Works (200 OK)
- ❌ `/dapp/clients` endpoints - 401 (authorization issue at API level)

### Production Environment  
- ✅ `GET /strains` - Works (200 OK)
- ❌ `/dapp/clients` endpoints - 401 (same authorization issue)

## Usage

### Explicit environment in request body:
```json
{
  "action": "get-strains",
  "countryCode": "ZAF",
  "env": "staging"
}
```

### Global override via environment variable:
Set `DRGREEN_USE_STAGING=true` to route all requests to staging.

## Technical Notes
- Backwards compatible - existing calls without `env` parameter continue to use production
- The `DRGREEN_STAGING_API_URL` secret contained invalid data, so URL validation was added
- Both staging and production have working strains endpoints, but `/dapp/clients` endpoints require different permissions
