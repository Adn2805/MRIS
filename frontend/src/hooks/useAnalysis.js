import { useState, useCallback, useRef } from 'react';

const API_BASE = '/api';

export function useAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [indices, setIndices] = useState([]);
    const [isLive, setIsLive] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const eventSourceRef = useRef(null);

    const fetchIndices = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/indices`);
            if (!res.ok) throw new Error('Failed to fetch indices');
            const json = await res.json();
            setIndices(json.indices);
        } catch (err) {
            console.error('Error fetching indices:', err);
        }
    }, []);

    const analyze = useCallback(async ({ index, period, threshold, startDate, endDate }) => {
        setLoading(true);
        setError(null);
        setData(null);

        const body = { index, threshold };
        if (startDate && endDate) {
            body.start_date = startDate;
            body.end_date = endDate;
        } else {
            body.period = period || '3mo';
        }

        try {
            const res = await fetch(`${API_BASE}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.detail || `Analysis failed (${res.status})`);
            }

            const json = await res.json();
            setData(json);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const stopLive = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsLive(false);
    }, []);

    const startLive = useCallback(({ index, period, threshold, startDate, endDate, interval }) => {
        // Close any existing stream
        stopLive();

        setError(null);
        setLoading(true);
        setIsLive(true);

        const params = new URLSearchParams({
            index,
            threshold: String(threshold),
        });

        if (startDate && endDate) {
            params.set('start_date', startDate);
            params.set('end_date', endDate);
        } else {
            params.set('period', period || '3mo');
        }

        if (interval) {
            params.set('interval', String(interval));
        }

        const url = `${API_BASE}/live/stream?${params.toString()}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('update', (event) => {
            try {
                const json = JSON.parse(event.data);
                setData(json);
                setLastUpdated(new Date());
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error('Error parsing SSE update:', err);
            }
        });

        es.addEventListener('error', (event) => {
            // Try to parse error data
            if (event.data) {
                try {
                    const err = JSON.parse(event.data);
                    setError(err.error || 'Live stream error');
                } catch {
                    setError('Live stream connection error');
                }
            }
            setLoading(false);
        });

        es.addEventListener('ping', () => {
            // Heartbeat — no action needed, keeps connection alive
        });

        es.onerror = () => {
            // EventSource will auto-reconnect, but let's indicate the error
            if (es.readyState === EventSource.CLOSED) {
                setIsLive(false);
                setError('Live stream connection lost');
                setLoading(false);
            }
        };
    }, [stopLive]);

    return {
        data,
        loading,
        error,
        indices,
        isLive,
        lastUpdated,
        fetchIndices,
        analyze,
        startLive,
        stopLive,
    };
}
