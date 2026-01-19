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
  
### MasterlistGrid Entities (Enhanced Filtering)
- ✅ Updated `MasterlistRow.tsx`:
  - Added clickable "Owner" field
  - Added clickable "City/Address" field
  - Implemented specific field filtering callbacks
- ✅ Updated `MasterlistGrid.tsx`:
  - Wired up `onFilterByOwner`, `onFilterByCity`, `onFilterByAddress`
  - Enabled deep drill-down by clicking row details directly

### Geographic Heatmap Cities
- ✅ Updated `GeographicHeatmap.tsx`:
  - Implemented "View All Entities" button in city details panel
  - Visualized city-specific statistics (Entity Count, Exposure, Risk Level)
- ✅ Integrated with `DashboardClient.tsx`:
  - `onCitySelect` switches to Database tab
  - Applies `cityFilter` effectively to MasterlistGrid
  
### Pattern Synthesis Cards
- ✅ Updated `PatternSynthesis.tsx`:
  - Implemented `PatternDetailModal`
  - Cards now open detailed view with evidence, deep dive, and notes
  - Added export functionality
  
### Suspect Profiler Interactivity
- ✅ Updated `SuspectProfiler.tsx`:
  - Added "Empire Value" interaction -> filter by owner
  - Added "View Entities" button -> filter by owner in MasterlistGrid
  - Integrated with `DashboardClient` to switch tabs and apply filters
  
### Risk Radar Interactivity
- ✅ Updated `RiskRadar.tsx`:
  - Added `onProgramSelect` callback
  - Added "FIND PROVIDERS" button to detailed view
- ✅ Updated `MasterlistGrid.tsx` & `DashboardClient.tsx`:
  - Added `licenseTypeFilter` prop and state
  - Wired up `RiskRadar` to filter MasterlistGrid by program type

## 🔨 TODO - Additional Click Interactions



### 4. Document Locker PDFs
**Location**: `components/DocumentLocker.tsx`
**Current**: PDFs open in new tab
**Keep as-is**: This is correct behavior





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
