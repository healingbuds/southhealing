---
description: How to set up GitHub Secret for automated FTP deployment
---

# Add CPANEL_PASSWORD Secret to GitHub

## Why This Is Needed
The automated deployment workflow uses FTP to deploy your site. It needs your cPanel password stored as a GitHub Secret.

## Steps to Add the Secret

### 1. Go to GitHub Repository Settings
Visit: https://github.com/healingbuds/sun712/settings/secrets/actions

### 2. Click "New repository secret"
Click the green "New repository secret" button in the top right.

### 3. Add the Secret
- **Name**: `CPANEL_PASSWORD`
- **Value**: Your cPanel password (the one you use to login to cPanel)

### 4. Click "Add secret"

## Verify Existing Secrets
You should now have these secrets:
- ✅ `CPANEL_USER` (already exists)
- ✅ `CPANEL_HOST` (already exists)  
- ✅ `CPANEL_SSH_KEY` (already exists)
- ✅ `CPANEL_PASSWORD` (you just added)

## Test the Automation

After adding the secret:

```powershell
# Make a small change
echo "# Automation test" >> README.md

# Commit and push
git add README.md
git commit -m "Test automated deployment"
git push origin main
```

Then:
1. Go to: https://github.com/healingbuds/sun712/actions
2. Watch the workflow run
3. Wait 2-3 minutes
4. Visit https://healingbuds.pt
5. Hard refresh (Ctrl+Shift+R)

## How It Works

```
Lovable publishes changes
         ↓
GitHub receives the push
         ↓
GitHub Actions triggers automatically
         ↓
Workflow checks for merge conflicts
         ↓
Builds the project (npm run build)
         ↓
Deploys via FTP using CPANEL_PASSWORD
         ↓
Site updates at healingbuds.pt
```

**Total time**: 2-3 minutes from Lovable publish to live site

## Troubleshooting

### If deployment still fails:
1. Check the password is correct
2. Verify FTP is enabled in cPanel
3. Check GitHub Actions logs for errors
4. Try manual deployment: `.\FIX-SITE-NOW.ps1`

### If site doesn't update:
1. Check GitHub Actions completed successfully
2. Hard refresh browser (Ctrl+Shift+R)
3. Check cPanel File Manager to verify files updated
4. Clear browser cache completely

## Security Note
GitHub Secrets are encrypted and never exposed in logs. Your password is safe.

---

**Once this secret is added, your automation will be 100% complete!**

Every time you publish from Lovable, the site will automatically update within 2-3 minutes.
