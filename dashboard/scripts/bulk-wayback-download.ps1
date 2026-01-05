# Bulk Wayback Machine Archive Downloader
# Downloads ALL historical snapshots of DHS License Lookup site
# Run overnight - expect ~310 snapshots to download

param(
    [string]$OutputDir = "$PSScriptRoot\..\data\dhs-monitor\wayback-archive",
    [int]$DelaySeconds = 2,  # Respectful delay between requests
    [switch]$Resume         # Resume from last downloaded
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "=== Wayback Machine Bulk Archive Downloader ===" -ForegroundColor Cyan
Write-Host "Output: $OutputDir"
Write-Host "Delay: ${DelaySeconds}s between requests"
Write-Host ""

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$progressFile = Join-Path $OutputDir "progress.json"
$summaryFile = Join-Path $OutputDir "archive_summary.csv"

# 1. Get list of all snapshots from CDX API
Write-Host "[1/3] Fetching snapshot list from Wayback CDX API..." -ForegroundColor Yellow

$cdxUrl = "https://web.archive.org/cdx/search/cdx?url=licensinglookup.dhs.state.mn.us&output=json&limit=1000"

try {
    $response = Invoke-WebRequest -Uri $cdxUrl -UseBasicParsing -TimeoutSec 60
    $data = $response.Content | ConvertFrom-Json
    
    # Skip header row
    $snapshots = $data | Select-Object -Skip 1
    Write-Host "  Found $($snapshots.Count) snapshots" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to fetch CDX data - $_" -ForegroundColor Red
    exit 1
}

# Load progress if resuming
$downloaded = @{}
if ($Resume -and (Test-Path $progressFile)) {
    $downloaded = Get-Content $progressFile -Raw | ConvertFrom-Json -AsHashtable
    Write-Host "  Resuming - already have $($downloaded.Count) snapshots" -ForegroundColor Gray
}

# 2. Download each snapshot
Write-Host "`n[2/3] Downloading snapshots..." -ForegroundColor Yellow
$count = 0
$errors = 0
$excusesFound = @()

# Initialize summary CSV
if (-not (Test-Path $summaryFile)) {
    "Timestamp,Date,HttpStatus,HasExcuse,ExcuseType,FileSize,Filename" | Out-File -FilePath $summaryFile -Encoding UTF8
}

foreach ($snapshot in $snapshots) {
    $timestamp = $snapshot[1]  # YYYYMMDDHHMMSS
    $statusCode = $snapshot[4]
    $originalUrl = $snapshot[2]
    
    # Format date for display
    $dateStr = "$($timestamp.Substring(0,4))-$($timestamp.Substring(4,2))-$($timestamp.Substring(6,2))"
    $timeStr = "$($timestamp.Substring(8,2)):$($timestamp.Substring(10,2)):$($timestamp.Substring(12,2))"
    
    # Skip if already downloaded
    if ($downloaded.ContainsKey($timestamp)) {
        continue
    }
    
    $count++
    $remaining = $snapshots.Count - $count - $downloaded.Count
    $pct = [math]::Round(($count + $downloaded.Count) / $snapshots.Count * 100, 1)
    
    Write-Host "[$count/$($snapshots.Count)] $dateStr $timeStr (HTTP $statusCode) - $pct% - ~$remaining remaining" -ForegroundColor Gray
    
    # Build Wayback URL
    $waybackUrl = "https://web.archive.org/web/$timestamp/$originalUrl"
    $filename = "snapshot_${timestamp}.html"
    $filepath = Join-Path $OutputDir $filename
    
    try {
        $headers = @{
            "User-Agent" = "CrosscheckBot/1.0 (Historical Research)"
        }
        $pageResponse = Invoke-WebRequest -Uri $waybackUrl -Headers $headers -UseBasicParsing -TimeoutSec 30
        $content = $pageResponse.Content
        
        # Save HTML
        $content | Out-File -FilePath $filepath -Encoding UTF8
        $fileSize = (Get-Item $filepath).Length
        
        # Check for excuse patterns
        $excuseType = ""
        $hasExcuse = $false
        
        $patterns = @{
            "CAPTCHA_BLOCK"         = "apologize for the inconvenience"
            "SYSTEMS_ISSUE"         = "systems issue"
            "MAINTENANCE"           = "maintenance"
            "BOT_DETECTION"         = "unusual activity"
            "RADWARE"               = "Radware|perfdrive"
            "DHS_AWARE"             = "DHS is aware"
            "DOCUMENTS_NOT_POSTING" = "documents from posting"
        }
        
        foreach ($key in $patterns.Keys) {
            if ($content -match $patterns[$key]) {
                $hasExcuse = $true
                $excuseType = $key
                $excusesFound += @{
                    timestamp = $timestamp
                    date      = $dateStr
                    type      = $key
                }
                Write-Host "    >>> EXCUSE FOUND: $key" -ForegroundColor Red
                break
            }
        }
        
        # Log to summary
        $summaryEntry = "$timestamp,$dateStr,$statusCode,$hasExcuse,$excuseType,$fileSize,$filename"
        $summaryEntry | Out-File -FilePath $summaryFile -Append -Encoding UTF8
        
        # Track progress
        $downloaded[$timestamp] = @{
            date   = $dateStr
            status = $statusCode
            excuse = $excuseType
            file   = $filename
        }
        
        # Save progress periodically
        if ($count % 10 -eq 0) {
            $downloaded | ConvertTo-Json -Depth 3 | Out-File -FilePath $progressFile -Encoding UTF8
        }
        
    }
    catch {
        $errors++
        Write-Host "    ERROR: $_" -ForegroundColor Red
        
        # Log error to summary
        "$timestamp,$dateStr,$statusCode,ERROR,DOWNLOAD_FAILED,0," | Out-File -FilePath $summaryFile -Append -Encoding UTF8
    }
    
    # Respectful delay
    Start-Sleep -Seconds $DelaySeconds
}

# Save final progress
$downloaded | ConvertTo-Json -Depth 3 | Out-File -FilePath $progressFile -Encoding UTF8

# 3. Summary
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n=== Download Complete ===" -ForegroundColor Cyan
Write-Host "Duration: $($duration.ToString('hh\:mm\:ss'))"
Write-Host "Total snapshots: $($snapshots.Count)"
Write-Host "Downloaded: $($downloaded.Count)"
Write-Host "Errors: $errors"
Write-Host "Excuses found: $($excusesFound.Count)"

if ($excusesFound.Count -gt 0) {
    Write-Host "`n*** HISTORICAL EXCUSES DETECTED ***" -ForegroundColor Yellow
    $excusesFound | ForEach-Object {
        Write-Host "  $($_.date): $($_.type)" -ForegroundColor Magenta
    }
    
    # Save excuse report
    $excuseReport = Join-Path $OutputDir "excuse_timeline.json"
    $excusesFound | ConvertTo-Json | Out-File -FilePath $excuseReport -Encoding UTF8
    Write-Host "`nExcuse timeline saved: $excuseReport"
}

# 4. Visual Capture (Screenshots)
Write-Host "`n[3/3] Starting Visual Capture (Screenshots)..." -ForegroundColor Yellow
Write-Host "  This phase renders the HTML snapshots into PNG images." -ForegroundColor Gray

# Check if playwright is installed in dashboard
$renderScript = Join-Path $PSScriptRoot "render-snapshots.js"

if (Test-Path $renderScript) {
    try {
        Write-Host "  Installing rendering dependencies (Playwright)..." -ForegroundColor Gray
        # Use npx -y to skip prompts
        & npx -y playwright install chromium
        
        Write-Host "  Running render script..." -ForegroundColor Cyan
        & node $renderScript
    }
    catch {
        Write-Host "  ERROR: Visual Capture failed - $_" -ForegroundColor Red
        Write-Host "  Manual run: node scripts/render-snapshots.js" -ForegroundColor Gray
    }
}

Write-Host "`nFiles saved to: $OutputDir"
