# Master Census Collector (87 County Sweep)
# Cycles through every MN county to build a 100% complete provider database
# Run overnight - expect ~1 hour to complete all 87 counties

param(
    [string]$OutputDir = "$PSScriptRoot\..\data\master-census",
    [int]$DelaySeconds = 15 # Respectful delay between counties
)

$ErrorActionPreference = "Continue"
Write-Host "=== Minnesota Provider Master Census ===" -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# The 87 Counties of Minnesota
$counties = @(
    "Aitkin", "Anoka", "Becker", "Beltrami", "Benton", "Big Stone", "Blue Earth", "Brown", 
    "Carlton", "Carver", "Cass", "Chippewa", "Chisago", "Clay", "Clearwater", "Cook", 
    "Cottonwood", "Crow Wing", "Dakota", "Dodge", "Douglas", "Faribault", "Fillmore", 
    "Freeborn", "Goodhue", "Grant", "Hennepin", "Houston", "Hubbard", "Isanti", "Itasca", 
    "Jackson", "Kanabec", "Kandiyohi", "Kittson", "Koochiching", "Lac qui Parle", "Lake", 
    "Lake of the Woods", "Le Sueur", "Lincoln", "Lyon", "McLeod", "Mahnomen", "Marshall", 
    "Martin", "Meeker", "Mille Lacs", "Morrison", "Mower", "Murray", "Nicollet", "Nobles", 
    "Norman", "Olmsted", "Otter Tail", "Pennington", "Pine", "Pipestone", "Polk", "Pope", 
    "Ramsey", "Red Lake", "Redwood", "Renville", "Rice", "Rock", "Roseau", "St. Louis", 
    "Scott", "Sherburne", "Sibley", "Stearns", "Steele", "Stevens", "Swift", "Todd", 
    "Traverse", "Wabasha", "Wadena", "Waseca", "Washington", "Watonwan", "Wilkin", "Winona", 
    "Wright", "Yellow Medicine"
)

Write-Host "Target: 87 Counties"
Write-Host "Output: $OutputDir"
Write-Host ""

$summaryFile = Join-Path $OutputDir "census_log.csv"
if (-not (Test-Path $summaryFile)) {
    "Timestamp,County,Status,RecordsCount,Filename" | Out-File -FilePath $summaryFile -Encoding UTF8
}

foreach ($county in $counties) {
    Write-Host "[*] Processing $county County..." -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $cleanCounty = $county -replace ' ', '_'
    $targetFile = Join-Path $OutputDir "${cleanCounty}_providers.csv"
    
    $success = $false
    while (-not $success) {
        try {
            # Triggering the census via the dashboard API
            $apiUrl = "http://localhost:3000/api/dhs-auto?county=$([uri]::EscapeDataString($county))&format=csv"
            
            $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 120 -ErrorAction Stop
            
            if ($response.Content.Length -gt 500) {
                $response.Content | Out-File -FilePath $targetFile -Encoding UTF8
                $lines = ($response.Content -split "`n").Count
                Write-Host "  Success: Saved $lines records to $targetFile" -ForegroundColor Green
                "$timestamp,$county,SUCCESS,$lines,$targetFile" | Out-File -FilePath $summaryFile -Append -Encoding UTF8
                $success = $true
            }
            else {
                Write-Host "  Empty/Small response - may be blocked or structured differently" -ForegroundColor Yellow
                "$timestamp,$county,EMPTY,0," | Out-File -FilePath $summaryFile -Append -Encoding UTF8
                $success = $true # Move on but log it
            }
        }
        catch {
            $err = $_.Exception.Response
            if ($err -and $err.StatusCode -eq 403) {
                Write-Host "  !!! 403 FORBIDDEN (Blocked) !!!" -ForegroundColor Red
                Write-Host "  Entering $cooldownMinutes minute cooldown period..." -ForegroundColor Yellow
                Start-Sleep -Seconds ($cooldownMinutes * 60)
                Write-Host "  Retrying $county..." -ForegroundColor Cyan
            }
            elseif ($err -and $err.StatusCode -eq 429) {
                Write-Host "  Rate limited by API. Waiting 60s..." -ForegroundColor Yellow
                Start-Sleep -Seconds 60
            }
            else {
                Write-Host "  Error: $_" -ForegroundColor Red
                "$timestamp,$county,ERROR,0," | Out-File -FilePath $summaryFile -Append -Encoding UTF8
                $success = $true # Skip to next county on other errors
            }
        }
    }
    
    if ($success) {
        # Wait before next county
        Write-Host "  Pacing: Sleeping ${DelaySeconds}s..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host "`n=== Master Census Complete ===" -ForegroundColor Cyan
