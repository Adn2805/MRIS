import React, { useState, useCallback } from 'react';
import { Briefcase, Plus, X, ShieldCheck, ShieldAlert, ShieldX, Search, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function PortfolioChecker() {
    const [tickers, setTickers] = useState([]);
    const [inputVal, setInputVal] = useState('');
    const [period, setPeriod] = useState('3mo');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addTicker = useCallback(() => {
        const val = inputVal.trim().toUpperCase();
        if (val && !tickers.includes(val) && tickers.length < 20) {
            setTickers(prev => [...prev, val]);
            setInputVal('');
        }
    }, [inputVal, tickers]);

    const removeTicker = useCallback((t) => {
        setTickers(prev => prev.filter(x => x !== t));
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') addTicker();
    }, [addTicker]);

    const checkPortfolio = useCallback(async () => {
        if (tickers.length < 2) {
            setError('Add at least 2 tickers to check');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/portfolio/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers, period }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Check failed');
            }
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [tickers, period]);

    const getRiskIcon = (level) => {
        if (level === 'Low Risk') return <ShieldCheck size={20} />;
        if (level === 'Moderate Risk') return <ShieldAlert size={20} />;
        return <ShieldX size={20} />;
    };

    const getRiskClass = (level) => {
        if (level === 'Low Risk') return 'risk-badge low';
        if (level === 'Moderate Risk') return 'risk-badge moderate';
        return 'risk-badge high';
    };

    const getCorrelationColor = (val) => {
        const v = Math.abs(val);
        if (v >= 0.7) return 'var(--risk-high)';
        if (v >= 0.4) return 'var(--risk-moderate)';
        return 'var(--risk-low)';
    };

    // Render markdown bold
    const renderText = (text) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
    };

    // Common Indian tickers for quick-add
    const quickTickers = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'ITC.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'SUNPHARMA.NS', 'TATAMOTORS.NS',
    ];

    return (
        <div className="portfolio-checker">
            <div className="portfolio-header">
                <Briefcase size={18} />
                <h3>Portfolio Risk Checker</h3>
            </div>
            <p className="portfolio-desc">
                Add the stocks you own (or plan to buy) to check how diversified your portfolio is.
                Use Yahoo Finance tickers — add <code>.NS</code> for Indian stocks (e.g., RELIANCE.NS).
            </p>

            {/* Quick-add chips */}
            <div className="quick-tickers">
                <span className="quick-label">Quick add:</span>
                {quickTickers.filter(t => !tickers.includes(t)).slice(0, 6).map(t => (
                    <button key={t} className="quick-chip" onClick={() => setTickers(prev => [...prev, t])}>
                        + {t.replace('.NS', '')}
                    </button>
                ))}
            </div>

            {/* Input row */}
            <div className="portfolio-input-row">
                <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type ticker and press Enter..."
                    className="portfolio-input"
                />
                <button className="portfolio-add-btn" onClick={addTicker} disabled={!inputVal.trim()}>
                    <Plus size={14} /> Add
                </button>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="portfolio-period">
                    <option value="1mo">1 Month</option>
                    <option value="3mo">3 Months</option>
                    <option value="6mo">6 Months</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>

            {/* Selected tickers */}
            {tickers.length > 0 && (
                <div className="selected-tickers">
                    {tickers.map(t => (
                        <span key={t} className="ticker-chip">
                            {t.replace('.NS', '').replace('.L', '').replace('.DE', '').replace('.HK', '')}
                            <button onClick={() => removeTicker(t)}><X size={12} /></button>
                        </span>
                    ))}
                </div>
            )}

            {/* Check button */}
            <button
                className="portfolio-check-btn"
                onClick={checkPortfolio}
                disabled={loading || tickers.length < 2}
            >
                {loading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><Search size={16} /> Check Portfolio Risk</>}
            </button>

            {error && <div className="portfolio-error">{error}</div>}

            {/* Results */}
            {result && (
                <div className="portfolio-results">
                    {/* Score card */}
                    <div className="score-card">
                        <div className="score-circle" style={{
                            '--score': result.diversification_score,
                            '--score-color': result.diversification_score >= 70 ? 'var(--risk-low)' :
                                result.diversification_score >= 40 ? 'var(--risk-moderate)' : 'var(--risk-high)'
                        }}>
                            <span className="score-number">{Math.round(result.diversification_score)}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                        <div className="score-info">
                            <div className={getRiskClass(result.risk_level)}>
                                {getRiskIcon(result.risk_level)}
                                <span>{result.risk_level}</span>
                            </div>
                            <p className="risk-description">{result.risk_description}</p>
                        </div>
                    </div>

                    {/* Missing tickers */}
                    {result.tickers_missing.length > 0 && (
                        <div className="missing-alert">
                            ⚠️ Tickers not found: {result.tickers_missing.join(', ')}
                        </div>
                    )}

                    {/* Correlation matrix */}
                    <div className="corr-matrix-section">
                        <h4>Correlation Matrix</h4>
                        <p className="matrix-hint">Higher values (red) mean stocks move together. Lower (green) = better diversification.</p>
                        <div className="corr-matrix-scroll">
                            <table className="corr-matrix">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {result.matrix_labels.map(l => <th key={l}>{l}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.correlation_matrix.map((row, i) => (
                                        <tr key={i}>
                                            <td className="matrix-label">{result.matrix_labels[i]}</td>
                                            {row.map((val, j) => (
                                                <td key={j}
                                                    className={i === j ? 'matrix-diag' : 'matrix-cell'}
                                                    style={i !== j ? { backgroundColor: getCorrelationColor(val), color: '#fff' } : {}}
                                                >
                                                    {i === j ? '—' : val.toFixed(2)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top correlations list */}
                    <div className="correlations-list">
                        <h4>Strongest Correlations</h4>
                        {result.correlations.slice(0, 5).map((c, i) => (
                            <div key={i} className="corr-item">
                                <span className="corr-pair">{c.ticker1} ↔ {c.ticker2}</span>
                                <span className="corr-bar-wrap">
                                    <span className="corr-bar" style={{
                                        width: `${Math.abs(c.correlation) * 100}%`,
                                        backgroundColor: getCorrelationColor(c.correlation)
                                    }}></span>
                                </span>
                                <span className="corr-val" style={{ color: getCorrelationColor(c.correlation) }}>
                                    {c.correlation.toFixed(3)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Suggestions */}
                    <div className="suggestions-list">
                        <h4>Suggestions</h4>
                        {result.suggestions.map((s, i) => (
                            <div key={i} className="suggestion-item">
                                {renderText(s)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
