import React from 'react';
import { Activity, HelpCircle } from 'lucide-react';

export default function Header({ onShowGuide }) {
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
                <div className="status-dot" />
                <span>Ready</span>
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
