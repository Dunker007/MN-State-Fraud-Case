'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react';

export default function DataIntakePage() {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));

        if (files.length === 0) {
            setMessage('Please drop .csv files only');
            setStatus('error');
            return;
        }

        setStatus('uploading');
        let successCount = 0;

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload-csv', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    successCount++;
                    setUploadedFiles(prev => [...prev, file.name]);
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (successCount > 0) {
            setStatus('success');
            setMessage(`Successfully uploaded ${successCount} files`);
        } else {
            setStatus('error');
            setMessage('Failed to upload files');
        }
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-neon-blue mb-2">Data Intake Center</h1>
                    <p className="text-zinc-400">
                        Drop DHS CSV exports here to enrich the masterlist.
                        Duplicate searches are automatically handled.
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    role="region"
                    aria-label="CSV upload drop zone"
                    className={`
                        border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                        flex flex-col items-center justify-center gap-4
                        ${isDragging
                            ? 'border-neon-blue bg-neon-blue/10 scale-105'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                        }
                    `}
                >
                    <Upload className={`w-12 h-12 ${isDragging ? 'text-neon-blue' : 'text-zinc-500'}`} />
                    <div>
                        <p className="text-lg font-bold">Drop CSV files here</p>
                        <p className="text-sm text-zinc-500 mt-1">Accepts Licensing_Lookup_*.csv exports</p>
                    </div>
                </div>

                {/* Status & Instructions */}
                <div className="space-y-4">
                    {status === 'success' && (
                        <div className="bg-green-950/30 border border-green-900 p-4 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-green-400">Upload Complete</h3>
                                <p className="text-sm text-zinc-400 mt-1">{message}</p>
                                <p className="text-sm text-zinc-400 mt-1">{message}</p>

                                {/* Merge Actions */}
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const btn = document.getElementById('run-merge-btn');
                                                if (btn) btn.innerText = 'Running...';

                                                const res = await fetch('/api/run-merge', { method: 'POST' });
                                                const data = await res.json();

                                                if (data.success) {
                                                    alert('Merge Complete!\n\n' + data.output);
                                                    setUploadedFiles([]); // Clear pending
                                                    setStatus('idle');
                                                } else {
                                                    alert('Error:\n' + data.message);
                                                }
                                            } catch {
                                                alert('Failed to call API');
                                            }
                                        }}
                                        id="run-merge-btn"
                                        className="bg-neon-blue text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Run Merge Script
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {uploadedFiles.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-zinc-400 mb-3">Pending Merge ({uploadedFiles.length})</h3>
                            <ul className="space-y-2">
                                {uploadedFiles.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <FileText className="w-4 h-4 text-zinc-600" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="border-t border-zinc-800 pt-8">
                    <h2 className="text-xl font-bold mb-4">How to get data</h2>
                    <ol className="list-decimal list-inside space-y-2 text-zinc-400">
                        <li>Go to <a href="https://licensinglookup.dhs.state.mn.us/" target="_blank" className="text-neon-blue hover:underline">MN DHS Licensing Lookup</a></li>
                        <li>Search for a term (e.g. "care", "home", "center")</li>
                        <li>Scroll to bottom and click headers to load all results</li>
                        <li>Click <strong>Send Results to CSV File</strong></li>
                        <li>Drop the downloaded file above</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
