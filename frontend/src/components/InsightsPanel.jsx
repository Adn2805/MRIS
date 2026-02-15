import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const PRIORITY_CONFIG = {
    critical: { label: 'CRITICAL', className: 'priority-critical' },
    high: { label: 'HIGH', className: 'priority-high' },
    medium: { label: 'MEDIUM', className: 'priority-medium' },
    low: { label: 'LOW', className: 'priority-low' },
    info: { label: 'INFO', className: 'priority-info' },
};

export default function InsightsPanel({ insights }) {
    const [expanded, setExpanded] = useState(false);

    if (!insights || insights.length === 0) return null;

    // Support both old string format and new {priority, text} format
    const parsed = insights.map(i => {
        if (typeof i === 'string') return { priority: 'info', text: i };
        return i;
    });

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
                    <Lightbulb size={13} />
                    <span>Key Findings</span>
                    <span className="insight-count">{parsed.length}</span>
                </div>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>

            {expanded && (
                <div className="insights-list">
                    {parsed.map((insight, i) => {
                        const cfg = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG.info;
                        return (
                            <div key={i} className={`insight-item ${cfg.className}`}>
                                <span className={`priority-badge ${cfg.className}`}>{cfg.label}</span>
                                <span className="insight-text">{renderText(insight.text)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
