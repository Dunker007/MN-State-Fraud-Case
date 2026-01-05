# DHS Site Monitor - Enhanced with Link Change Detection
# Captures: Status, excuses, HTML, AND detects new/changed links
# Alerts on new links that may need monitoring

param(
    [string]$DashboardUrl = "http://localhost:3000",
    [string]$OutputDir = "$PSScriptRoot\..\data\dhs-monitor\snapshots"
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$date = Get-Date -Format "yyyy-MM-dd"

Write-Host "=== DHS Enhanced Monitor - $timestamp ===" -ForegroundColor Cyan

# Ensure directories exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$logFile = Join-Path $OutputDir "daily_log.csv"
$htmlFile = Join-Path $OutputDir "snapshot_$timestamp.html"
$linksFile = Join-Path $OutputDir "known_links.json"
$alertsFile = Join-Path $OutputDir "new_link_alerts.csv"

# Load known links from previous runs
$knownLinks = @{}
if (Test-Path $linksFile) {
    try {
        $knownLinks = Get-Content $linksFile -Raw | ConvertFrom-Json -AsHashtable
    }
    catch {
        $knownLinks = @{}
    }
}

# 1. Run API check if dashboard is running
Write-Host "[1/4] Running site check..." -ForegroundColor Yellow
$status = "UNKNOWN"
$excuseType = ""

try {
    $checkResult = Invoke-WebRequest -Uri "$DashboardUrl/api/dhs-monitor?action=check" -UseBasicParsing -TimeoutSec 30
    $checkData = $checkResult.Content | ConvertFrom-Json
    $status = $checkData.check.status
    $excuseType = $checkData.check.excuse_type
    
    $color = if ($status -eq "up") { "Green" } else { "Red" }
    Write-Host "  Status: $status" -ForegroundColor $color
    if ($excuseType) { Write-Host "  Excuse: $excuseType" -ForegroundColor Yellow }
}
catch {
    Write-Host "  Dashboard not running, doing direct check" -ForegroundColor Gray
}

# 2. Direct HTML capture
Write-Host "[2/4] Capturing DHS page..." -ForegroundColor Yellow
$dhsUrl = "https://licensinglookup.dhs.state.mn.us/"
$excusesFound = @()
$content = ""

try {
    $headers = @{
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    $response = Invoke-WebRequest -Uri $dhsUrl -Headers $headers -UseBasicParsing -TimeoutSec 30
    $content = $response.Content
    $content | Out-File -FilePath $htmlFile -Encoding UTF8
    
    # Check for excuse patterns
    $patterns = @{
        "CAPTCHA_BLOCK"         = "apologize for the inconvenience"
        "SYSTEMS_ISSUE"         = "systems issue"
        "MAINTENANCE"           = "maintenance"
        "TEMP_UNAVAILABLE"      = "temporarily unavailable"
        "BOT_DETECTION"         = "unusual activity"
        "RADWARE"               = "Radware"
        "DHS_AWARE"             = "DHS is aware"
        "DOCUMENTS_NOT_POSTING" = "documents from posting"
        "MNIT_BLAME"            = "working with MNIT"
    }
    
    foreach ($key in $patterns.Keys) {
        if ($content -match $patterns[$key]) {
            $excusesFound += $key
            if (-not $excuseType) { $excuseType = $key }
        }
    }
    
    if ($excusesFound.Count -gt 0) {
        $status = "DEGRADED"
        Write-Host "  EXCUSES FOUND: $($excusesFound -join ', ')" -ForegroundColor Red
    }
    else {
        if ($status -eq "UNKNOWN") { $status = "UP" }
        Write-Host "  No excuses detected" -ForegroundColor Green
    }
    Write-Host "  Saved: $htmlFile" -ForegroundColor Green
    
}
catch {
    $status = "DOWN"
    $excuseType = "FETCH_ERROR"
    Write-Host "  ERROR: $_" -ForegroundColor Red
    "FETCH_ERROR: $_`n$timestamp" | Out-File -FilePath $htmlFile
}

# 3. LINK CHANGE DETECTION
Write-Host "[3/4] Analyzing page links..." -ForegroundColor Yellow
$currentLinks = @{}
$newLinks = @()
$changedLinks = @()

if ($content) {
    # Extract all hrefs
    $hrefPattern = 'href\s*=\s*["'']([^"'']+)["'']'
    $hrefMatches = [regex]::Matches($content, $hrefPattern, 'IgnoreCase')
    
    foreach ($match in $hrefMatches) {
        $href = $match.Groups[1].Value
        
        # Normalize and filter
        if ($href -match "^(https?://|/)" -and $href -notmatch "(\.css|\.js|\.ico|\.png|\.jpg|\.gif|#|javascript:)") {
            # Make relative URLs absolute
            if ($href -match "^/") {
                $href = "https://licensinglookup.dhs.state.mn.us$href"
            }
            
            # Extract link text if available
            $linkContext = ""
            if ($content -match "href\s*=\s*[`"']$([regex]::Escape($href))[`"'][^>]*>([^<]{0,100})") {
                $linkContext = $Matches[1] -replace '\s+', ' '
            }
            
            $currentLinks[$href] = @{
                url       = $href
                context   = $linkContext.Trim()
                firstSeen = $timestamp
            }
        }
    }
    
    Write-Host "  Found $($currentLinks.Count) links on page" -ForegroundColor Gray
    
    # Compare with known links
    foreach ($url in $currentLinks.Keys) {
        if (-not $knownLinks.ContainsKey($url)) {
            $newLinks += @{
                url        = $url
                context    = $currentLinks[$url].context
                discovered = $timestamp
            }
            # Add to known links
            $knownLinks[$url] = $currentLinks[$url]
        }
    }
    
    # Check for removed links (might indicate hiding something)
    $removedLinks = @()
    foreach ($url in $knownLinks.Keys) {
        if (-not $currentLinks.ContainsKey($url) -and $url -match "licensinglookup\.dhs\.state\.mn\.us") {
            $removedLinks += $url
        }
    }
    
    # Report new links
    if ($newLinks.Count -gt 0) {
        Write-Host "`n  *** NEW LINKS DETECTED ***" -ForegroundColor Magenta
        foreach ($link in $newLinks) {
            Write-Host "    + $($link.url)" -ForegroundColor Magenta
            if ($link.context) {
                Write-Host "      Context: $($link.context)" -ForegroundColor Gray
            }
            
            # Log alert
            $alertEntry = "$timestamp,NEW_LINK,$($link.url),$($link.context -replace ',', ';')"
            $alertEntry | Out-File -FilePath $alertsFile -Append -Encoding UTF8
        }
        Write-Host "  Logged $($newLinks.Count) new links to alerts file" -ForegroundColor Yellow
    }
    else {
        Write-Host "  No new links detected" -ForegroundColor Green
    }
    
    # Report removed links
    if ($removedLinks.Count -gt 0) {
        Write-Host "`n  *** LINKS REMOVED ***" -ForegroundColor Red
        foreach ($url in $removedLinks) {
            Write-Host "    - $url" -ForegroundColor Red
            $alertEntry = "$timestamp,REMOVED_LINK,$url,"
            $alertEntry | Out-File -FilePath $alertsFile -Append -Encoding UTF8
        }
    }
    
    # Save updated known links
    $knownLinks | ConvertTo-Json -Depth 3 | Out-File -FilePath $linksFile -Encoding UTF8
}

# 4. Request archival
Write-Host "[4/4] Requesting archival..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "https://web.archive.org/save/$dhsUrl" -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
    Write-Host "  Wayback: requested" -ForegroundColor Gray
}
catch { }

# Log entry
$logEntry = "$date,$timestamp,$status,$excuseType,$($excusesFound -join ';'),$($newLinks.Count),$htmlFile"
if (-not (Test-Path $logFile)) {
    "Date,Timestamp,Status,ExcuseType,AllExcuses,NewLinksCount,HtmlFile" | Out-File -FilePath $logFile -Encoding UTF8
}
$logEntry | Out-File -FilePath $logFile -Append -Encoding UTF8

# Summary
Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "Status: $status | Excuses: $($excusesFound.Count) | New Links: $($newLinks.Count)"

# Return exit code based on findings
if ($newLinks.Count -gt 0 -or $excusesFound.Count -gt 0) {
    Write-Host "`n*** ATTENTION REQUIRED - New findings detected ***" -ForegroundColor Yellow
}
