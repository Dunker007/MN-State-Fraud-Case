"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StickyNote,
    X,
    Save,
    Trash2,
    Plus,
    ChevronRight,
    FileText,
    History,
    Search
} from 'lucide-react';
import DataBackupControls from './DataBackupControls';

interface DetectiveNote {
    id: string;
    text: string;
    timestamp: number;
    title?: string;
    category?: 'entity' | 'pattern' | 'theory' | 'draft';
}

export default function InvestigatorNotes() {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState<DetectiveNote[]>([]);
    const [currentNote, setCurrentNote] = useState('');
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Load notes from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('glass_house_notes');
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse notes', e);
            }
        }
    }, []);

    // Save notes to localStorage
    const saveNotes = (updatedNotes: DetectiveNote[]) => {
        setNotes(updatedNotes);
        localStorage.setItem('glass_house_notes', JSON.stringify(updatedNotes));
    };

    const handleSave = () => {
        if (!currentNote.trim()) return;

        if (currentId) {
            const updated = notes.map(n =>
                n.id === currentId
                    ? { ...n, text: currentNote, timestamp: Date.now() }
                    : n
            );
            saveNotes(updated);
        } else {
            const newNote: DetectiveNote = {
                id: Date.now().toString(),
                text: currentNote,
                timestamp: Date.now(),
                category: 'draft'
            };
            saveNotes([newNote, ...notes]);
            setCurrentId(newNote.id);
        }
    };

    const handleDelete = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        saveNotes(updated);
        if (currentId === id) {
            setCurrentId(null);
            setCurrentNote('');
        }
    };

    const startNew = () => {
        setCurrentId(null);
        setCurrentNote('');
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-zinc-900 border border-zinc-700 p-4 rounded-full shadow-2xl hover:border-white transition-all group"
                title="Open Case Scratchpad"
            >
                <StickyNote className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                {notes.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-neon-red text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black font-bold">
                        {notes.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />

                        {/* Sidebar/Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-black">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                                        <History className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tighter">Forensic_Scratchpad</h2>
                                        <p className="text-[10px] text-zinc-500 font-mono">INVESTIGATOR SESSION PERSISTENCE</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Editor Area */}
                            <div className="p-6 bg-zinc-900/50">
                                <textarea
                                    value={currentNote}
                                    onChange={(e) => setCurrentNote(e.target.value)}
                                    placeholder="Enter case note, suspect link, or pattern observation..."
                                    className="w-full h-40 bg-black/80 border border-zinc-800 rounded-lg p-4 text-zinc-300 font-mono text-sm placeholder:text-zinc-700 outline-none focus:border-zinc-500 transition-colors resize-none"
                                />
                                <div className="mt-4 flex items-center justify-between">
                                    <button
                                        onClick={startNew}
                                        className="text-[10px] text-zinc-500 hover:text-white font-mono flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> NEW_NOTE
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="bg-white text-black text-xs font-bold px-4 py-2 rounded border border-white hover:bg-black hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {currentId ? 'UPDATE_ENTRY' : 'SAVE_TO_DOSSIER'}
                                    </button>
                                </div>
                            </div>

                            {/* History List */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                <h3 className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Case History
                                </h3>

                                <div className="space-y-4">
                                    {notes.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
                                            <Search className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                                            <p className="text-xs text-zinc-600 font-mono">NO ACTIVE FINDINGS RECORDED</p>
                                        </div>
                                    ) : (
                                        notes.map((note) => (
                                            <motion.div
                                                key={note.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => {
                                                    setCurrentId(note.id);
                                                    setCurrentNote(note.text);
                                                }}
                                                className={`group p-4 rounded-lg border transition-all cursor-pointer relative ${currentId === note.id
                                                    ? 'bg-zinc-800 border-white'
                                                    : 'bg-black border-zinc-900 hover:border-zinc-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] text-zinc-500 font-mono">
                                                        {new Date(note.timestamp).toLocaleTimeString()} // {new Date(note.timestamp).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(note.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-neon-red transition-all"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-zinc-400 line-clamp-3 group-hover:text-zinc-200 transition-colors">
                                                    {note.text}
                                                </p>
                                                {currentId !== note.id && (
                                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Footer/Warning */}
                            <div className="p-4 border-t border-zinc-900 bg-black">
                                <DataBackupControls />
                                <div className="mt-4 text-[9px] text-zinc-700 font-mono text-center">
                                    DATA STORED LOCALLY IN BROWSER PERSISTENCE LAYER. CLEARING COOKIES WILL ERASE FINDINGS.
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
