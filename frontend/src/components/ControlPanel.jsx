import React, { useState } from 'react';
import { Search, Radio, Square, Calendar } from 'lucide-react';

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
    onStartLive,
    onStopLive,
    loading,
    isLive,
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

    return (
        <div className="control-panel">
            {/* Index selector */}
            <div className="control-group">
                <span className="control-label">Index</span>
                <select
                    className="control-select"
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(e.target.value)}
                    disabled={isLive}
                >
                    {indices.map((idx) => (
                        <option key={idx.name} value={idx.name}>
                            {idx.name} ({idx.stock_count})
                        </option>
                    ))}
                </select>
            </div>

            {/* Period buttons */}
            <div className="control-group">
                <span className="control-label">Period</span>
                <div className="period-group">
                    {PERIODS.map((p) => (
                        <button
                            key={p}
                            className={`period-btn ${!useCustomDates && period === p ? 'active' : ''}`}
                            onClick={() => handlePeriodClick(p)}
                            disabled={isLive}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                    <button
                        className={`period-btn custom-btn ${useCustomDates ? 'active' : ''}`}
                        onClick={handleCustomClick}
                        disabled={isLive}
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
                        disabled={isLive}
                    />
                    <span className="date-separator">→</span>
                    <input
                        type="date"
                        className="control-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isLive}
                    />
                </div>
            )}

            {/* Threshold slider */}
            <div className="control-group">
                <span className="control-label">Threshold</span>
                <div className="threshold-control">
                    <input
                        type="range"
                        className="threshold-slider"
                        min="0.3"
                        max="0.9"
                        step="0.05"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        disabled={isLive}
                    />
                    <span className="threshold-value">{threshold.toFixed(2)}</span>
                </div>
            </div>

            {/* Analyze button */}
            <button
                className="analyze-btn"
                onClick={onAnalyze}
                disabled={loading || isLive}
            >
                {loading && !isLive ? (
                    <>
                        <div className="btn-spinner" />
                        Analyzing…
                    </>
                ) : (
                    <>
                        <Search size={14} />
                        Analyze
                    </>
                )}
            </button>

            {/* Live toggle */}
            {isLive ? (
                <button className="live-btn live-btn-active" onClick={onStopLive}>
                    <Square size={12} />
                    Stop Live
                </button>
            ) : (
                <button
                    className="live-btn"
                    onClick={onStartLive}
                    disabled={loading}
                >
                    <Radio size={12} />
                    Go Live
                </button>
            )}
        </div>
    );
}
