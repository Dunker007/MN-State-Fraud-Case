# Historical Document Recovery Tool
# Finds and downloads all PDFs, Excels, and Docs ever hosted on the DHS licensing site
# Run overnight to build a complete forensic document library

param(
    [string]$OutputDir = "$PSScriptRoot\..\data\dhs-monitor\historical-docs",
    [int]$DelaySeconds = 2
)

$ErrorActionPreference = "Continue"
Write-Host "=== DHS Historical Document Recovery ===" -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# 1. Query Wayback for all document types
Write-Host "[1/2] Fetching list of all documents ever hosted..." -ForegroundColor Yellow
# Searching for common document extensions
$extensions = @("pdf", "xls", "xlsx", "doc", "docx", "csv")
$allSnapshots = @()

foreach ($ext in $extensions) {
    Write-Host "  Searching for *.$ext ..." -ForegroundColor Gray
    $cdxUrl = "https://web.archive.org/cdx/search/cdx?url=licensinglookup.dhs.state.mn.us&matchType=domain&output=json&limit=5000&filter=mimetype:application/.*$ext.*"
    try {
        $response = Invoke-WebRequest -Uri $cdxUrl -UseBasicParsing -TimeoutSec 60
        $data = $response.Content | ConvertFrom-Json
        if ($data.Count -gt 1) {
            $allSnapshots += $data | Select-Object -Skip 1
        }
    }
    catch {
        Write-Host "  Error searching for $ext" -ForegroundColor Red
    }
}

Write-Host "`n  Found $($allSnapshots.Count) document records across history" -ForegroundColor Green

# 2. Download documents
Write-Host "[2/2] Downloading documents..." -ForegroundColor Yellow
$summaryFile = Join-Path $OutputDir "document_index.csv"
if (-not (Test-Path $summaryFile)) {
    "Timestamp,Date,Filename,Type,OriginalUrl,WaybackUrl" | Out-File -FilePath $summaryFile -Encoding UTF8
}

$count = 0
foreach ($record in $allSnapshots) {
    $timestamp = $record[1]
    $originalUrl = $record[2]
    $mimetype = $record[3]
    
    # Extract filename
    $filename = Split-Path $originalUrl -Leaf
    if (-not $filename -or $filename -eq "licensinglookup.dhs.state.mn.us") {
        $filename = "doc_$timestamp"
    }
    
    # Clean filename of query params
    $filename = $filename -replace '\?.*$', ''
    # Add timestamp to name for uniqueness
    $finalFilename = "${timestamp}_$filename"
    $filepath = Join-Path $OutputDir $finalFilename
    
    if (Test-Path $filepath) { continue }
    
    $count++
    $waybackUrl = "https://web.archive.org/web/$timestamp/$originalUrl"
    Write-Host "[$count/$($allSnapshots.Count)] Downloading: $filename" -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $waybackUrl -OutFile $filepath -UseBasicParsing -TimeoutSec 30
        
        $dateStr = "$($timestamp.Substring(0,4))-$($timestamp.Substring(4,2))-$($timestamp.Substring(6,2))"
        "$timestamp,$dateStr,$finalFilename,$mimetype,$originalUrl,$waybackUrl" | Out-File -FilePath $summaryFile -Append -Encoding UTF8
    }
    catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $DelaySeconds
}

Write-Host "`n=== Recovery Complete ===" -ForegroundColor Cyan
Write-Host "Total documents recovered: $count"
Write-Host "Index saved to: $summaryFile"
