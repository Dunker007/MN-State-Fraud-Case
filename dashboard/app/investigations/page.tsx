
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Link as LinkIcon, StickyNote, X, User, MapPin } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Node {
    id: string;
    type: 'entity' | 'note' | 'evidence';
    x: number;
    y: number;
    content: string;
    description?: string;
    meta?: any;
}

interface Connection {
    id: string;
    from: string;
    to: string;
    label?: string;
}

export default function InvestigationsPage() {
    // Canvas State
    const [nodes, setNodes] = useState<Node[]>([
        { id: '1', type: 'note', x: 400, y: 300, content: 'START HERE', description: 'Trace the money from Feeding Our Future' },
        { id: '2', type: 'entity', x: 600, y: 400, content: 'Feeding Our Future', description: 'Primary Sponsor', meta: { license: 'MN-99999' } }
    ]);
    const [connections, setConnections] = useState<Connection[]>([
        { id: 'c1', from: '1', to: '2', label: 'Investigate' }
    ]);

    const [tool, setTool] = useState<'select' | 'note' | 'connect'>('select');
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Mock "Add Entity" Search
    const [isSearching, setIsSearching] = useState(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            setZoom(z => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const addNote = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setNodes(prev => [...prev, {
            id,
            type: 'note',
            x: -pan.x + window.innerWidth / 2, // Center of screen relative to pan
            y: -pan.y + window.innerHeight / 2,
            content: 'New Lead',
            description: ''
        }]);
    };

    // --- Search Logic ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
                    const data = await res.json();
                    setSearchResults(data.results || []);
                } catch (e) {
                    console.error('Search failed', e);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const addEntity = (entity: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNodes(prev => [...prev, {
            id,
            type: 'entity',
            x: -pan.x + window.innerWidth / 2 + (Math.random() * 50),
            y: -pan.y + window.innerHeight / 2 + (Math.random() * 50),
            content: entity.name,
            description: entity.owner || 'Unknown Owner',
            meta: { license: entity.license_id }
        }]);
        // Clear search after adding to avoid clutter
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="h-screen w-full bg-[#1a1a1a] overflow-hidden relative cursor-crosshair">
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
            />

            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-black/80 p-2 rounded border border-zinc-700 backdrop-blur-md">
                <button
                    onClick={() => setTool('select')}
                    className={`p-2 rounded ${tool === 'select' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
                    title="Select / Move"
                >
                    <Search className="w-5 h-5" />
                </button>
                <button
                    onClick={addNote}
                    className={`p-2 rounded ${tool === 'note' ? 'bg-yellow-600' : 'hover:bg-zinc-800'}`}
                    title="Add Sticky Note"
                >
                    <StickyNote className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('connect')}
                    className={`p-2 rounded ${tool === 'connect' ? 'bg-red-600' : 'hover:bg-zinc-800'}`}
                    title="Draw Connection (Red String)"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Canvas Area */}
            <div
                className="w-full h-full relative transform-gpu"
                onWheel={handleWheel}
                ref={canvasRef}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{
                        x: pan.x,
                        y: pan.y,
                        scale: zoom
                    }}
                >
                    {/* Render Connections */}
                    <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
                        {connections.map(conn => {
                            const from = nodes.find(n => n.id === conn.from);
                            const to = nodes.find(n => n.id === conn.to);
                            if (!from || !to) return null;

                            return (
                                <line
                                    key={conn.id}
                                    x1={from.x + 100} y1={from.y + 50}
                                    x2={to.x + 100} y2={to.y + 50}
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                            );
                        })}
                    </svg>

                    {/* Render Nodes */}
                    {nodes.map(node => (
                        <motion.div
                            key={node.id}
                            drag
                            dragMomentum={false}
                            onDrag={(event, info) => {
                                // Update node position in state for saving
                                // This simple version just lets Framer handle visual drag
                            }}
                            className={`
                                absolute w-64 p-4 rounded shadow-2xl border cursor-move select-none
                                ${node.type === 'note' ? 'bg-yellow-200 text-black border-yellow-400 rotate-1' : ''}
                                ${node.type === 'entity' ? 'bg-zinc-900 text-white border-zinc-700' : ''}
                            `}
                            style={{ left: node.x, top: node.y }}
                        >
                            {/* Pin Graphics */}
                            <div className="absolute -top-3 left-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md border border-red-800 transform -translate-x-1/2 z-10" />

                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase opacity-50">{node.type}</span>
                                <button className="hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>

                            <h3 className="font-bold text-lg leading-tight mb-2 font-handwriting">
                                {node.content}
                            </h3>
                            {node.description && (
                                <p className="text-sm opacity-80 font-handwriting">{node.description}</p>
                            )}

                            {node.type === 'entity' && (
                                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 text-xs">
                                    <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                                        <User className="w-3 h-3" />
                                        {node.meta?.license || 'UNKNOWN'}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}

                </motion.div>
            </div>

            {/* Search / Add Entity Modal */}
            <div className="absolute top-4 right-4 w-80 max-h-[80vh] flex flex-col pointer-events-auto">
                <div className="bg-black/90 p-4 rounded border border-zinc-700 shadow-2xl flex flex-col gap-4">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Evidence Locker</h3>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Masterlist..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pl-8"
                            />
                            <Search className="w-4 h-4 text-zinc-500 absolute left-2 top-2.5" />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="overflow-y-auto max-h-[400px] flex flex-col gap-2 transition-all duration-300">
                        {searchResults.length > 0 ? (
                            searchResults.map(result => (
                                <button
                                    key={result.license_id}
                                    onClick={() => addEntity(result)}
                                    className="text-left bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 p-2 rounded transition-colors group flex items-start gap-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-zinc-200 group-hover:text-white truncate">
                                            {result.name}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="text-[10px] text-zinc-500 font-mono">
                                                MN-{result.license_id}
                                            </div>
                                        </div>
                                    </div>
                                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-green-500 mt-1" />
                                </button>
                            ))
                        ) : searchQuery.length > 2 ? (
                            <div className="text-center py-4 text-xs text-zinc-600 italic">No matches found.</div>
                        ) : searchQuery.length > 0 && (
                            <div className="text-center py-4 text-xs text-zinc-600 italic">Enter 3+ chars to search</div>
                        )}
                    </div>

                    {searchResults.length === 0 && searchQuery.length === 0 && (
                        <div className="mt-2 text-xs text-zinc-500 text-center italic border-t border-zinc-800 pt-2">
                            Search to add new nodes.
                        </div>
                    )}
                </div>
            </div>

            {/* Title / Watermark */}
            <div className="absolute bottom-6 right-6 pointer-events-none opacity-50">
                <h1 className="text-4xl font-black italic text-zinc-700 uppercase">
                    Investigation Board <span className="text-red-900">CASE #24-001</span>
                </h1>
            </div>

        </div>
    );
}
