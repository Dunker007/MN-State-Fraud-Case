"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Plus,
    X,
    FileText,
    Download,
    Trash2,
    ExternalLink,
    Search,
    Printer
} from 'lucide-react';

interface BoardItem {
    id: string;
    type: 'entity' | 'person' | 'pattern' | 'note' | 'custom';
    title: string;
    subtitle?: string;
    description?: string;
    color: string;
    links: Array<{ type: string; label: string; action: () => void }>;
    metadata?: Record<string, unknown>;
}

interface InvestigationBoardProps {
    onNavigate?: (tab: string, params?: Record<string, unknown>) => void;
}

export default function InvestigationBoard({ onNavigate }: InvestigationBoardProps) {
    const [items, setItems] = useState<BoardItem[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [boardName, setBoardName] = useState('Investigation Board');
    const [editingName, setEditingName] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('investigation_board');
        if (saved) {
            const data = JSON.parse(saved);
            setItems(data.items || []);
            setBoardName(data.name || 'Investigation Board');
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('investigation_board', JSON.stringify({
            items,
            name: boardName,
            lastSaved: new Date().toISOString()
        }));
    }, [items, boardName]);

    const addItem = (item: Omit<BoardItem, 'id'>) => {
        const newItem: BoardItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const clearBoard = () => {
        if (confirm('Clear entire investigation board? This cannot be undone.')) {
            setItems([]);
            setBoardName('Investigation Board');
        }
    };

    const exportBoard = () => {
        const exportData = {
            name: boardName,
            items: items.map(item => ({
                ...item,
                links: [] // Remove function references
            })),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investigation_${boardName.replace(/\s+/g, '_')}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {editingName ? (
                            <input
                                type="text"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                                onBlur={() => setEditingName(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                                className="text-2xl font-bold text-white bg-black border border-blue-500 rounded px-2 py-1 outline-none"
                                autoFocus
                            />
                        ) : (
                            <h2
                                onClick={() => setEditingName(true)}
                                className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                            >
                                {boardName}
                            </h2>
                        )}
                        <span className="text-xs text-zinc-500 font-mono">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddDialog(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                        <button
                            onClick={() => window.open('/case-report', '_blank')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Report
                        </button>
                        <button
                            onClick={exportBoard}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={clearBoard}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </button>
                    </div>
                </div>
                <p className="text-zinc-400 text-sm">
                    Build your case by adding entities, patterns, suspects, and custom notes. Drag to reorder. Click links to navigate.
                </p>
            </div>

            {/* Board Canvas */}
            <div className="bg-black/30 border border-zinc-800 rounded-xl p-6 min-h-[600px]">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-zinc-600">
                        <FileText className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-xl font-mono mb-2">Empty Investigation Board</p>
                        <p className="text-sm">Click "Add Item" to start building your case</p>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
                        {items.map((item) => (
                            <Reorder.Item key={item.id} value={item}>
                                <motion.div
                                    layout
                                    className={`p-4 rounded-lg border-2 ${item.color} cursor-move hover:scale-[1.01] transition-transform`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                            {item.subtitle && (
                                                <p className="text-sm text-zinc-400 font-mono">{item.subtitle}</p>
                                            )}
                                            {item.description && (
                                                <p className="text-sm text-zinc-300 mt-2">{item.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                                        </button>
                                    </div>

                                    {/* Quick Links */}
                                    {item.links.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-700">
                                            {item.links.map((link, i) => (
                                                <button
                                                    key={i}
                                                    onClick={link.action}
                                                    className="flex items-center gap-1 px-2 py-1 bg-black/40 hover:bg-blue-600/20 border border-zinc-700 hover:border-blue-500 rounded text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {link.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-2 gap-2">
                                            {Object.entries(item.metadata).map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                    <span className="text-zinc-600">{key}: </span>
                                                    <span className="text-zinc-400">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
            </div>

            {/* Add Item Dialog */}
            <AddItemDialog
                isOpen={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onAdd={addItem}
                onNavigate={onNavigate}
            />
        </div>
    );
}

// Add Item Dialog Component
interface AddItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Omit<BoardItem, 'id'>) => void;
    onNavigate?: (tab: string, params?: Record<string, unknown>) => void;
}

function AddItemDialog({ isOpen, onClose, onAdd, onNavigate }: AddItemDialogProps) {
    const [mode, setMode] = useState<'select' | 'custom'>('select');
    const [customTitle, setCustomTitle] = useState('');
    const [customDescription, setCustomDescription] = useState('');
    const [customSource, setCustomSource] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddCustom = () => {
        if (!customTitle.trim()) return;

        const links: BoardItem['links'] = [];

        // Try to search for the name in entities
        if (customTitle.trim()) {
            links.push({
                type: 'search',
                label: `Search Database for ${customTitle}`,
                action: () => {
                    onNavigate?.('database');
                    // TODO: Set search term in grid
                }
            });
        }

        onAdd({
            type: 'custom',
            title: customTitle,
            subtitle: customSource || 'External Source',
            description: customDescription,
            color: 'bg-amber-950/20 border-amber-600',
            links,
            metadata: {
                source: customSource,
                addedAt: new Date().toLocaleDateString()
            }
        });

        setCustomTitle('');
        setCustomDescription('');
        setCustomSource('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Add to Investigation Board</h3>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setMode('select')}
                                className={`px-4 py-2 rounded text-sm transition-colors ${mode === 'select'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                From Dashboard
                            </button>
                            <button
                                onClick={() => setMode('custom')}
                                className={`px-4 py-2 rounded text-sm transition-colors ${mode === 'custom'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                Custom Entry
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {mode === 'custom' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Name / Entity *</label>
                                    <input
                                        type="text"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="e.g., John Smith, XYZ Corporation, Suspicious Pattern"
                                        className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Source</label>
                                    <input
                                        type="text"
                                        value={customSource}
                                        onChange={(e) => setCustomSource(e.target.value)}
                                        placeholder="e.g., Star Tribune Article, Anonymous Tip, Court Filing"
                                        className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Notes / Description</label>
                                    <textarea
                                        value={customDescription}
                                        onChange={(e) => setCustomDescription(e.target.value)}
                                        placeholder="Add any relevant details, connections, or observations..."
                                        className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:border-blue-500 outline-none min-h-[120px]"
                                    />
                                </div>

                                <button
                                    onClick={handleAddCustom}
                                    disabled={!customTitle.trim()}
                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded transition-colors font-mono"
                                >
                                    Add to Board
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search entities, patterns, suspects..."
                                        className="w-full bg-black border border-zinc-700 rounded pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <p className="text-sm text-zinc-500 text-center py-8">
                                    Quick-add from dashboard coming soon. For now, use "Custom Entry" to manually add items.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
