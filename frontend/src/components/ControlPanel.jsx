import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { InfoTooltip } from './GuidedTour';

const PERIODS = ['1mo', '3mo', '6mo', '1y'];
const PERIOD_LABELS = { '1mo': '1M', '3mo': '3M', '6mo': '6M', '1y': '1Y' };

export default function ControlPanel({
    indices,
    selectedIndex,
    setSelectedIndex,
    period,
    setPeriod,
    threshold,
    setThreshold,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onAnalyze,
    loading,
}) {
    const [useCustomDates, setUseCustomDates] = useState(false);

    const handlePeriodClick = (p) => {
        setUseCustomDates(false);
        setPeriod(p);
    };

    const handleCustomClick = () => {
        setUseCustomDates(true);
        setPeriod(null);
    };

    const getThresholdHint = (val) => {
        if (val >= 0.8) return 'Only the strongest connections';
        if (val >= 0.65) return 'Moderate — good starting point';
        if (val >= 0.5) return 'Showing weaker connections too';
        return 'Very loose — lots of connections';
    };

    return (
        <div className="control-panel">
            {/* Index selector */}
            <div className="control-group">
                <span className="control-label">
                    Stock Group
                    <InfoTooltip text="A collection of top stocks from a country's market. Pick the one you want to explore." />
                </span>
                <select
                    className="control-select"
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(e.target.value)}
                >
                    {indices.map((idx) => (
                        <option key={idx.name} value={idx.name}>
                            {idx.name} ({idx.stock_count} stocks)
                        </option>
                    ))}
                </select>
            </div>

            {/* Period buttons */}
            <div className="control-group">
                <span className="control-label">
                    Time Range
                    <InfoTooltip text="How far back to look. Longer periods reveal more stable patterns between stocks." />
                </span>
                <div className="period-group">
                    {PERIODS.map((p) => (
                        <button
                            key={p}
                            className={`period-btn ${!useCustomDates && period === p ? 'active' : ''}`}
                            onClick={() => handlePeriodClick(p)}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                    <button
                        className={`period-btn custom-btn ${useCustomDates ? 'active' : ''}`}
                        onClick={handleCustomClick}
                    >
                        <Calendar size={10} style={{ marginRight: 3, verticalAlign: -1 }} />
                        Custom
                    </button>
                </div>
            </div>

            {/* Custom date inputs */}
            {useCustomDates && (
                <div className="control-group date-range-group">
                    <input
                        type="date"
                        className="control-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="date-separator">→</span>
                    <input
                        type="date"
                        className="control-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            )}

            {/* Threshold slider */}
            <div className="control-group">
                <span className="control-label">
                    Connection Strength
                    <InfoTooltip text="Controls how strong the relationship between two stocks must be to show a connection. Higher = fewer but stronger links." />
                </span>
                <div className="threshold-control">
                    <input
                        type="range"
                        className="threshold-slider"
                        min="0.3"
                        max="0.9"
                        step="0.05"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    />
                    <span className="threshold-value">{threshold.toFixed(2)}</span>
                </div>
                <span className="threshold-hint">{getThresholdHint(threshold)}</span>
            </div>

            {/* Analyze button */}
            <button
                className="analyze-btn"
                onClick={onAnalyze}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <div className="btn-spinner" />
                        Building Network…
                    </>
                ) : (
                    <>
                        <Search size={14} />
                        Analyze Network
                    </>
                )}
            </button>

            {/* Quick help */}
            <div className="control-help">
                💡 Click <strong>Analyze Network</strong> to see how stocks are connected. Bigger circles = more influential stocks.
            </div>
        </div>
    );
}
