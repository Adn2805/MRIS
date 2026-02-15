import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';

export default function InsightsPanel({ insights }) {
    const [expanded, setExpanded] = useState(true);

    if (!insights || insights.length === 0) return null;

    const getInsightIcon = (text) => {
        if (text.includes('🏆') || text.includes('📊')) return <TrendingUp size={14} />;
        if (text.includes('🔴') || text.includes('⚠')) return <AlertTriangle size={14} />;
        if (text.includes('🟢') || text.includes('✅')) return <Shield size={14} />;
        return <Zap size={14} />;
    };

    const getInsightClass = (text) => {
        if (text.includes('🔴')) return 'insight-item danger';
        if (text.includes('🟡')) return 'insight-item warning';
        if (text.includes('🟢')) return 'insight-item success';
        return 'insight-item';
    };

    // Clean markdown bold markers for display
    const renderText = (text) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
    };

    return (
        <div className="insights-panel">
            <div className="insights-header" onClick={() => setExpanded(!expanded)}>
                <div className="insights-title">
                    <Lightbulb size={16} />
                    <span>Smart Insights</span>
                    <span className="insight-count">{insights.length}</span>
                </div>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expanded && (
                <div className="insights-list">
                    {insights.map((insight, i) => (
                        <div key={i} className={getInsightClass(insight)}>
                            <div className="insight-icon">{getInsightIcon(insight)}</div>
                            <div className="insight-text">{renderText(insight)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
