#!/usr/bin/env python3
"""
Owner Hunter Script
Enriches masterlist.json with deep links to MN Secretary of State filings
to find the hidden human owners (Registered Agents) behind LLC shells.

Usage: python scripts/OwnerHunter.py
Input:  lib/masterlist.json
Output: lib/targets_with_links.csv
"""

import json
import urllib.parse
import csv
import os

# CONFIGURATION
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'lib', 'masterlist.json')
OUTPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'lib', 'targets_with_links.csv')

def generate_search_link(business_name):
    """
    Generates a Google Search link specifically targeting the MN SOS site 
    because the direct MBLS search URL is session-walled.
    """
    query = f'site:sos.state.mn.us "{business_name}" "Registered Agent"'
    return f"https://www.google.com/search?q={urllib.parse.quote(query)}"

def analyze_and_enrich():
    print(f"📂 Loading from: {INPUT_FILE}")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle the structure (dict vs list)
    entities = data.get('entities', []) if isinstance(data, dict) else data
    
    print(f"🔍 Loaded {len(entities):,} entities. Hunting for high-value targets...")

    prioritized_targets = []
    ghost_offices = []

    for entity in entities:
        name = entity.get('name', 'Unknown')
        status = entity.get('status', 'Unknown')
        street = entity.get('street', '')
        city = entity.get('city', '')
        
        # Track "Ghost Offices" - no street address
        if not street or street.strip() == '' or 'County' in street:
            ghost_offices.append({
                'License_ID': entity.get('license_id'),
                'Name': name,
                'Status': status,
                'Address': f"{street}, {city}" if street else city
            })
        
        # FILTER: We only care about 'Active', 'Suspended', or the 'Oct 9 Denials'
        # We skip 'Closed' to save time, unless it was closed recently.
        if status in ['Active', 'Suspended', 'Denied', 'Revoked', 'Conditional']:
            
            # GENERATE THE SEARCH LINK
            link = generate_search_link(name)
            
            prioritized_targets.append({
                'License_ID': entity.get('license_id'),
                'Name': name,
                'Status': status,
                'Status_Date': entity.get('status_date', ''),
                'City': city,
                'County': entity.get('county', ''),
                'Service_Type': entity.get('service_type', ''),
                'MBLS_Deep_Link': link
            })

    # Sort by Status (Denied/Revoked/Suspended first), then by Status Date (Newest First)
    status_priority = {'Denied': 0, 'Revoked': 1, 'Suspended': 2, 'Conditional': 3, 'Active': 4}
    prioritized_targets.sort(key=lambda x: (
        status_priority.get(x['Status'], 5),
        x['Status_Date'] or '00/00/0000'
    ), reverse=False)

    # Save main targets to CSV
    if prioritized_targets:
        keys = prioritized_targets[0].keys()
        with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(prioritized_targets)
        print(f"✅ Generated {OUTPUT_FILE}")
        print(f"   → {len(prioritized_targets):,} searchable targets")
    
    # Save ghost offices report
    ghost_file = OUTPUT_FILE.replace('.csv', '_ghost_offices.csv')
    if ghost_offices:
        with open(ghost_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=ghost_offices[0].keys())
            writer.writeheader()
            writer.writerows(ghost_offices)
        print(f"🚩 Found {len(ghost_offices):,} 'Ghost Offices' (no street address)")
        print(f"   → Saved to {ghost_file}")
    
    # Status breakdown
    print("\n📊 Status Breakdown:")
    status_counts = {}
    for t in prioritized_targets:
        status_counts[t['Status']] = status_counts.get(t['Status'], 0) + 1
    for status, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"   {status}: {count:,}")
    
    print("\n🚀 Open the CSV and click 'MBLS_Deep_Link' to find the Registered Agent.")
    print("   Look for: 'Registered Agent' or 'Manager' - that's the human owner.")

if __name__ == "__main__":
    analyze_and_enrich()
