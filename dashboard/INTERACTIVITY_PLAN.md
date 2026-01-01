# Dashboard Interactivity Hardening Plan

## ✅ COMPLETED

### Employee Dossiers (Deep Dive)
- ✅ Created `EmployeeDossierModal.tsx` with:
  - Full profile details with investigation status
  - Intelligence report display
  - Persistent investigator notes (localStorage)
  - Related connections section
  - Save functionality with visual feedback
  - Priority scoring display
- ✅ Updated `EmployeeDossier.tsx`:
  - Added click handlers to all dossier cards
  - Hover effects (`cursor-pointer`, `hover:scale-[1.02]`)
  - Modal integration
- ✅ Enhanced `lib/dossiers.ts`:
  - Added `priorityScore` and `intelNotes` fields
  - Updated all dossier entries
  - Improved sorting by priority

## 🔨 TODO - Additional Click Interactions

### 1. Pattern Synthesis Cards
**Location**: `components/PatternSynthesis.tsx`
**Action**: Make pattern cards open detailed modal showing:
- Full evidence list with timestamps
- Related entities affected
- Timeline visualization
- Export/Print options
- Investigation notes

### 2. Suspect Profiler
**Location**: `components/SuspectProfiler.tsx`
**Current**: Already clickable (shows dossier view)
**Enhancement Needed**:
- Add "Related Entities" button that filters MasterlistGrid
- Add "View Network" button that shows connection graph
- Make empire value clickable to show breakdown

### 3. MasterlistGrid Entities
**Location**: `components/MasterlistGrid.tsx`
**Current**: Rows are clickable (opens EntityDetailModal)
**Enhancements**:
- Make Owner names clickable → filter to show all entities by that owner
- Make Address clickable → show all entities at that address
- Make License Type clickable → filter by license type
- Add "View on Map" button → highlight on Geographic Heatmap

### 4. Document Locker PDFs
**Location**: `components/DocumentLocker.tsx`
**Current**: PDFs open in new tab
**Keep as-is**: This is correct behavior

### 5. Geographic Heatmap Cities
**Location**: `components/GeographicHeatmap.tsx`
**Current**: Cities show details in side panel
**Enhancement**:
- When city is selected, offer "View All Entities" button
- Filter MasterlistGrid to show only that city's entities
- Show city-specific statistics

### 6. Risk Radar
**Location**: `components/RiskRadar.tsx`
**Enhancement**:
- Make risk nodes clickable
- Show detailed risk breakdown modal
- Link to affected entities

### 7. Timeline Events
**Location**: `components/Timeline.tsx`
**Enhancement**:
- Make timeline events clickable
- Show event details modal
- Link to related entities/documents
- Add investigation notes per event

### 8. Network Connections
**Enhancement**: Create new component
- Visualize entity ownership networks
- Clickable nodes to drill into specific entities
- Highlight suspicious patterns
- Export network diagram

### 9. Command Palette Results
**Location**: `components/CommandPalette.tsx`
**Current**: Already has navigation
**Verify**: All result types properly navigate

### 10. Investigator Search Results
**Location**: `components/InvestigatorSearch.tsx`
**Current**: Entity results open modal
**Enhancement**:
- Add "View Related" for each result
- Show connection strength
- Add to "Investigation Board" feature

## 📊 New Features to Consider

### Investigation Board
- Drag-and-drop workspace
- Pin entities, patterns, documents
- Draw connections
- Export as report

### Cross-Reference Panel
- Show all references to selected entity
- Appears in patterns, documents, networks
- Quick navigation between references

### Evidence Tagging
- Tag documents/entities with custom labels
- Filter by tags
- Organize investigation threads

### Export Ecosystem
- Export filtered data as CSV
- Print investigative reports
- Generate prosecutor briefings
- Timeline exports

## Priority Order

1. ✅ Employee Dossiers (DONE)
2. Pattern Synthesis Modal (High impact)
3. MasterlistGrid enhanced filtering (High utility)
4. Geographic Heatmap → Grid integration
5. Investigation Board (Comprehensive feature)
6. Timeline event details
7. Network visualization
8. Cross-reference panel
