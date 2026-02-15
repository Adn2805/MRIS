import React from 'react';

export default function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loading-rings">
                <div className="loading-ring" />
                <div className="loading-ring" />
                <div className="loading-ring" />
            </div>
            <div className="loading-text">Analyzing Market Structure</div>
            <div className="loading-sub">
                Fetching prices · Computing correlations · Building network graph
            </div>
        </div>
    );
}
