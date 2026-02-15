import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function useAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [indices, setIndices] = useState([]);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        indices,
        fetchIndices,
        analyze,
    };
}
