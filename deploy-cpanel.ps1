# === Healing Buds – One-shot build + upload to cPanel (FTP) ===
# Run this AFTER you cd into your project folder (where package.json is).

Write-Host "=== Healing Buds – cPanel static deploy ===" -ForegroundColor Cyan

# Use current directory as project root
$projectRoot  = Get-Location
$distDir    = Join-Path $projectRoot "dist"
$runNpmInstall = $true   # change to $false if you don't want npm install

Write-Host "`nProject root: $projectRoot"
Write-Host "Dist dir will be: $distDir"

# 1) npm install (optional)
if ($runNpmInstall) {
    Write-Host "`n[1/4] Running 'npm install'..." -ForegroundColor Yellow
    $npmInstall = Start-Process npm -ArgumentList "install" -NoNewWindow -PassThru -Wait
    if ($npmInstall.ExitCode -ne 0) {
        Write-Error "npm install failed (exit code $($npmInstall.ExitCode)). Fix errors and run this script again."
        return
    }
} else {
    Write-Host "[1/4] Skipping 'npm install' (runNpmInstall = false)." -ForegroundColor DarkYellow
}

# 2) npm run build
Write-Host "`n[2/4] Running 'npm run build'..." -ForegroundColor Yellow
$npmBuild = Start-Process npm -ArgumentList "run build" -NoNewWindow -PassThru -Wait
if ($npmBuild.ExitCode -ne 0) {
    Write-Error "npm run build failed (exit code $($npmBuild.ExitCode)). Fix build errors and run this script again."
    return
}

if (-not (Test-Path $distDir)) {
    Write-Error "Dist directory '$distDir' not found. Check your Vite build config."
    return
}

Write-Host "`nBuild complete. Files are in: $distDir" -ForegroundColor Green

# 3) Ask for cPanel FTP details
Write-Host "`n[3/4] Enter your cPanel / FTP details:" -ForegroundColor Cyan
$ftpHost = Read-Host "FTP host (e.g. ftp.healingbuds.pt or your server hostname)"
$ftpUser = Read-Host "FTP username (your cPanel username)"
$securePass = Read-Host "FTP password" -AsSecureString
$ftpPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
)

$remoteRoot = Read-Host "Remote folder (document root, e.g. public_html or public_html/subfolder). Press Enter for 'public_html'"
if ([string]::IsNullOrWhiteSpace($remoteRoot)) {
    $remoteRoot = "public_html"
}

$baseUri = "ftp://$ftpHost/$remoteRoot".TrimEnd('/') + "/"
Write-Host "`n[4/4] Uploading static site to $baseUri" -ForegroundColor Yellow

# 4) Simple FTP uploader using FtpWebRequest
function Upload-FtpFile {
    param(
        [string]$localFile,
        [string]$remoteUri,
        [string]$user,
        [string]$pass
    )

    $request = [System.Net.FtpWebRequest]::Create($remoteUri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $request.UseBinary = $true
    $request.UsePassive = $true
    $request.KeepAlive = $false

    $fileBytes = [System.IO.File]::ReadAllBytes($localFile)
    $request.ContentLength = $fileBytes.Length

    try {
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileBytes, 0, $fileBytes.Length)
        $requestStream.Close()
        $response = $request.GetResponse()
        $response.Close()
    } catch {
        throw $_
    }
}

function Ensure-FtpDirectory {
    param(
        [string]$remoteDir,
        [string]$user,
        [string]$pass
    )

    # FtpWebRequest doesn't have an easy "ensure", so we attempt to create and ignore errors.
    try {
        $req = [System.Net.FtpWebRequest]::Create($remoteDir.TrimEnd('/') + "/")
        $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.UsePassive = $true
        $req.KeepAlive = $false
        $req.GetResponse().Close()
    } catch {
        # If it already exists or fails silently, we ignore.
    }
}

function Upload-FtpFolder {
    param(
        [string]$localPath,
        [string]$remoteBase,
        [string]$user,
        [string]$pass
    )

    # Ensure base directory
    Ensure-FtpDirectory -remoteDir $remoteBase -user $user -pass $pass

    # Upload all files in this directory
    Get-ChildItem -LiteralPath $localPath -File | ForEach-Object {
        $fileName = $_.Name
        $localFile = $_.FullName
        $remoteFile = $remoteBase.TrimEnd('/') + "/" + $fileName

        Write-Host "Uploading $fileName -> $remoteFile" -ForegroundColor DarkGray
        Upload-FtpFile -localFile $localFile -remoteUri $remoteFile -user $user -pass $pass
    }

    # Recurse into subdirectories
    Get-ChildItem -LiteralPath $localPath -Directory | ForEach-Object {
        $subLocal = $_.FullName
        $subRemote = $remoteBase.TrimEnd('/') + "/" + $_.Name
        Upload-FtpFolder -localPath $subLocal -remoteBase $subRemote -user $user -pass $pass
    }
}

try {
    Upload-FtpFolder -localPath $distDir -remoteBase $baseUri -user $ftpUser -pass $ftpPass
    Write-Host "`n✅ Upload complete!" -ForegroundColor Green
    Write-Host "Now ensure your domain's document root in cPanel is set to '$remoteRoot'."
    Write-Host "Then visit your site in the browser and hard refresh (Ctrl+F5)."
} catch {
    Write-Error "`n❌ Upload failed: $($_.Exception.Message)"
    Write-Host "Check FTP host/user/password and that FTP is enabled on your Brixly cPanel account."
}
