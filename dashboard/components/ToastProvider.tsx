"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X, XCircle } from "lucide-react";

interface Toast {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        color: "text-green-500",
        bg: "bg-green-950/50",
        border: "border-green-900/50",
    },
    error: {
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-950/50",
        border: "border-red-900/50",
    },
    warning: {
        icon: AlertTriangle,
        color: "text-amber-500",
        bg: "bg-amber-950/50",
        border: "border-amber-900/50",
    },
    info: {
        icon: Info,
        color: "text-blue-500",
        bg: "bg-blue-950/50",
        border: "border-blue-900/50",
    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        const duration = toast.duration || 4000;
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: "success", title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: "error", title, message });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: "warning", title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: "info", title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const config = toastConfig[toast.type];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100 }}
                                className={`${config.bg} ${config.border} border backdrop-blur-sm rounded-lg p-4 shadow-xl flex items-start gap-3`}
                            >
                                <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-medium">{toast.title}</div>
                                    {toast.message && (
                                        <div className="text-zinc-400 text-xs mt-0.5">{toast.message}</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
