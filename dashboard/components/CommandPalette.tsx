"use client";

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Command,
    Database,
    Target,
    FileText,
    TrendingUp,
    AlertTriangle,
    User,
    Building2,
    CornerDownLeft,
    Users,
    Clipboard
} from 'lucide-react';
import { searchMasterlist, getTopSIPs } from '@/lib/data';
import { getDossierList } from '@/lib/dossiers';
import { type Entity } from '@/lib/schemas';


interface SearchResult {
    id: string;
    type: 'entity' | 'defendant' | 'target' | 'pattern' | 'document' | 'action' | 'dossier' | 'board_item' | 'sip';
    title: string;
    subtitle: string;
    icon: typeof Search;
    action: () => void;
}

interface CommandPaletteContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    executeSearch: (query: string) => SearchResult[];
    navigateTo: (tab: string, entityId?: string) => void;
    showEntityDetails: (entityId: string) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function useCommandPalette() {
    const context = useContext(CommandPaletteContext);
    if (!context) {
        throw new Error('useCommandPalette must be used within CommandPaletteProvider');
    }
    return context;
}

interface CommandPaletteProviderProps {
    children: React.ReactNode;
    entities: Entity[];
    onNavigate: (tab: string) => void;
    onEntitySelect: (entity: Entity) => void;
}

export function CommandPaletteProvider({
    children,
    entities,
    onNavigate,
    onEntitySelect
}: CommandPaletteProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
    }, []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    const navigateTo = useCallback((tab: string, _entityId?: string) => {
        onNavigate(tab);
        close();
    }, [onNavigate, close]);

    const showEntityDetails = useCallback((entityId: string) => {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
            onEntitySelect(entity);
            onNavigate('entities');
        }
        close();
    }, [entities, onEntitySelect, onNavigate, close]);

    const executeSearch = useCallback((searchQuery: string): SearchResult[] => {
        if (!searchQuery.trim()) {
            // Show quick actions when empty
            return [
                { id: 'nav-overview', type: 'action', title: 'Go to MN Fraud Watch', subtitle: 'Fraud summary & patterns', icon: TrendingUp, action: () => navigateTo('overview') },
                { id: 'nav-investigation', type: 'action', title: 'Go to Investigation', subtitle: 'Obstruction timeline', icon: Target, action: () => navigateTo('investigation') },
                { id: 'nav-entities', type: 'action', title: 'Go to Entities', subtitle: 'Search 19,000+ providers', icon: Database, action: () => navigateTo('entities') },
                { id: 'nav-evidence', type: 'action', title: 'Go to Evidence', subtitle: 'Documents & cases', icon: FileText, action: () => navigateTo('evidence') },
            ];
        }

        const q = searchQuery.toLowerCase();

        // Search Dossiers (Personnel)
        const dossiers = getDossierList();
        const dossierResults: SearchResult[] = dossiers
            .filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.role.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .map(d => ({
                id: d.id,
                type: 'dossier' as const,
                title: d.name,
                subtitle: `Dossier: ${d.role} • Status: ${d.investigationStatus}`,
                icon: User,
                action: () => {
                    navigateTo('org-chart');
                    close();
                }
            }));

        // Search Board Items (User's investigation)
        let boardResults: SearchResult[] = [];
        try {
            const savedBoard = localStorage.getItem('investigation_board');
            if (savedBoard) {
                const data = JSON.parse(savedBoard);
                if (data.items && Array.isArray(data.items)) {
                    boardResults = data.items
                        .filter((item: { title?: string; subtitle?: string; description?: string }) =>
                            item.title?.toLowerCase().includes(q) ||
                            item.subtitle?.toLowerCase().includes(q) ||
                            item.description?.toLowerCase().includes(q)
                        )
                        .slice(0, 5)
                        .map((item: { id: string; title: string; subtitle?: string }) => ({
                            id: item.id,
                            type: 'board_item' as const,
                            title: item.title,
                            subtitle: `Investigation Board • ${item.subtitle || 'Note'}`,
                            icon: Clipboard,
                            action: () => {
                                navigateTo('board');
                                close();
                            }
                        }));
                }
            }
        } catch (e) {
            console.error('Failed to search board items', e);
        }

        // Search SIPs (Owners)
        const topSIPs = getTopSIPs(100);
        const sipResults: SearchResult[] = topSIPs
            .filter(sip => sip.owner.toLowerCase().includes(q))
            .slice(0, 3)
            .map(sip => ({
                id: `sip-${sip.owner}`,
                type: 'sip' as const,
                title: sip.owner,
                subtitle: `SIP OWNER • ${sip.count} Entities • Avg Risk: ${sip.risk}`,
                icon: Users,
                action: () => {
                    navigateTo('entities'); // TODO: Deep link to SIP view in Network Graph
                    close();
                }
            }));

        // Search FULL masterlist (19k+ entities)
        const masterlistResults = searchMasterlist(searchQuery, 10);
        const entityResults: SearchResult[] = masterlistResults.map(e => {
            return {
                id: e.license_id,
                type: 'entity' as const,
                title: e.name,
                subtitle: `${e.status} • ${e.city}, MN`,
                icon: Building2,
                action: () => {
                    // For masterlist entities, navigate to entities tab
                    // and trigger provider checker with this entity
                    navigateTo('entities');
                    close();
                }
            };
        });

        // Also search curated entities for high-value matches
        const curatedResults: SearchResult[] = entities
            .filter(e =>
                e.name?.toLowerCase().includes(q) ||
                e.holder?.toLowerCase().includes(q) ||
                e.id?.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .map(e => ({
                id: e.id,
                type: 'entity' as const,
                title: e.name,
                subtitle: `⚠️ FLAGGED • Risk: ${e.risk_score} • ${e.status?.split(' as of')[0] || 'Unknown'}`,
                icon: AlertTriangle,
                action: () => showEntityDetails(e.id)
            }));

        // Add pattern searches
        const patternResults: SearchResult[] = [];
        const phoenix = 'phoenix'; // Added definition of phoenix
        const rebrand = 'rebrand'; // Added definition of rebrand
        const obstruction = 'obstruction'; // Added definition
        const witness = 'witness'; // Added definition
        const silence = 'silence'; // Added definition

        if (phoenix.includes(q) || rebrand.includes(q)) {
            patternResults.push({
                id: 'pattern-phoenix',
                type: 'pattern',
                title: 'Phoenix Protocol Pattern',
                subtitle: '47 rebrand cases detected',
                icon: AlertTriangle,
                action: () => navigateTo('overview')
            });
        }
        if (obstruction.includes(q) || witness.includes(q) || silence.includes(q)) {
            patternResults.push({
                id: 'pattern-silence',
                type: 'pattern',
                title: 'Silence Protocol Pattern',
                subtitle: '5 witness eliminations',
                icon: Target,
                action: () => navigateTo('investigation')
            });
        }

        // Curated (flagged) first, then dossiers, board items, SIPs, then patterns, then masterlist
        return [...curatedResults, ...dossierResults, ...boardResults, ...sipResults, ...patternResults, ...entityResults];
    }, [entities, navigateTo, showEntityDetails, close]);

    // Update results when query changes
    useEffect(() => {
        setResults(executeSearch(query));
        setSelectedIndex(0);
    }, [query, executeSearch]);

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle, close, isOpen]);

    // Handle keyboard navigation in results
    const handleNavigationKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            results[selectedIndex].action();
        }
    };

    const contextValue: CommandPaletteContextType = {
        isOpen,
        open,
        close,
        toggle,
        executeSearch,
        navigateTo,
        showEntityDetails
    };

    return (
        <CommandPaletteContext.Provider value={contextValue}>
            {children}

            {/* Command Palette Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={close}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
                        >
                            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                                    <Search className="w-5 h-5 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={handleNavigationKeyDown}
                                        placeholder="Search entities, patterns, or type a command..."
                                        className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none font-mono"
                                        autoFocus
                                    />
                                    <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
                                        ESC
                                    </kbd>
                                </div>

                                {/* Results */}
                                <div className="max-h-80 overflow-y-auto">
                                    {results.length === 0 && query && (
                                        <div className="p-4 text-center text-zinc-500 text-sm">
                                            No results found for {query}
                                        </div>
                                    )}

                                    {results.map((result, index) => {
                                        const Icon = result.icon;
                                        const isSelected = index === selectedIndex;

                                        return (
                                            <button
                                                key={result.id}
                                                onClick={result.action}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded ${result.type === 'entity' ? 'bg-purple-950/50' :
                                                    result.type === 'pattern' ? 'bg-red-950/50' :
                                                        'bg-zinc-800'
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${result.type === 'entity' ? 'text-purple-400' :
                                                        result.type === 'pattern' ? 'text-neon-red' :
                                                            'text-zinc-400'
                                                        }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-medium truncate">
                                                        {result.title}
                                                    </div>
                                                    <div className="text-zinc-500 text-xs truncate">
                                                        {result.subtitle}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <CornerDownLeft className="w-4 h-4 text-zinc-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="p-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
                                    <div className="flex items-center gap-4">
                                        <span>↑↓ Navigate</span>
                                        <span>↵ Select</span>
                                        <span>ESC Close</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Command className="w-3 h-3" />
                                        <span>K to toggle</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </CommandPaletteContext.Provider>
    );
}
