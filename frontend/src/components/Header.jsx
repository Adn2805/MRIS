import React from 'react';
import { Activity, Radio, HelpCircle } from 'lucide-react';

function formatTimeAgo(date) {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
}

export default function Header({ isLive, lastUpdated, onShowGuide }) {
    return (
        <header className="header">
            <div className="header-brand">
                <div className="header-logo">M</div>
                <div>
                    <div className="header-title">MRIS</div>
                    <div className="header-subtitle">Market Relationship Intelligence</div>
                </div>
            </div>

            <div className="header-status">
                {isLive ? (
                    <>
                        <div className="live-badge">
                            <Radio size={10} />
                            LIVE
                        </div>
                        {lastUpdated && (
                            <span className="last-updated">
                                Updated {formatTimeAgo(lastUpdated)}
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        <div className="status-dot" />
                        <span>Ready</span>
                    </>
                )}
                <Activity size={12} style={{ marginLeft: 4 }} />
                <button
                    className="header-help-btn"
                    onClick={onShowGuide}
                    title="Show the guided tour"
                >
                    <HelpCircle size={14} />
                </button>
            </div>
        </header>
    );
}
