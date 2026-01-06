"use client";

import { useEffect, useRef } from 'react';

export function useSSE<T>(url: string, onMessage: (data: T) => void) {
    const callbackRef = useRef(onMessage);

    useEffect(() => {
        callbackRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                if (event.data === 'connected') return;
                const parsed = JSON.parse(event.data);
                callbackRef.current(parsed);
            } catch (error) {
                console.error('SSE Error:', error);
            }
        };

        eventSource.onerror = (error) => {
            // EventSource auto-reconnects on error usually.
            // We log but don't close unless we want to stop retrying.
            // console.warn('SSE Connection Error (will retry):', error);
        };

        return () => {
            eventSource.close();
        };
    }, [url]);
}
