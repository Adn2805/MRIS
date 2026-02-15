import React, { useState } from 'react';
import { Grid3x3, Info } from 'lucide-react';

export default function SectorHeatmap({ sectorData }) {
    const [hoveredCell, setHoveredCell] = useState(null);

    if (!sectorData || !sectorData.sectors || sectorData.sectors.length < 2) {
        return (
            <div className="sector-heatmap empty-heatmap">
                <Grid3x3 size={24} />
                <p>Not enough sector data available for this index.</p>
            </div>
        );
    }

    const { sectors, matrix, sector_stocks } = sectorData;

    const getColor = (val) => {
        const v = Math.max(-1, Math.min(1, val));
        if (v >= 0) {
            const r = Math.round(255);
            const g = Math.round(255 - v * 180);
            const b = Math.round(100 - v * 100);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const r = Math.round(100 + v * 100);
            const g = Math.round(180 + v * 80);
            const b = Math.round(255);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    const getTextColor = (val) => {
        return Math.abs(val) > 0.5 ? '#fff' : '#222';
    };

    const getMeaning = (val) => {
        if (val > 0.5) return 'Move together strongly';
        if (val > 0.2) return 'Somewhat connected';
        if (val > -0.2) return 'Move independently';
        return 'Move in opposite directions';
    };

    return (
        <div className="sector-heatmap">
            <div className="heatmap-header">
                <Grid3x3 size={18} />
                <div>
                    <h3>How Do Sectors Compare?</h3>
                    <p className="heatmap-subtitle">
                        This table shows whether different market sectors (like Banking, IT, Pharma)
                        tend to move in the same direction or independently.
                    </p>
                </div>
            </div>

            {/* Simple legend */}
            <div className="heatmap-legend">
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'rgb(255, 75, 0)' }}></span>
                    <span>Move together</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'rgb(200, 200, 200)' }}></span>
                    <span>Independent</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'rgb(0, 100, 255)' }}></span>
                    <span>Move apart</span>
                </div>
            </div>

            {/* Heatmap grid */}
            <div className="heatmap-scroll">
                <table className="heatmap-table">
                    <thead>
                        <tr>
                            <th className="heatmap-corner"></th>
                            {sectors.map(s => (
                                <th key={s} className="heatmap-col-label">
                                    <span>{s}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sectors.map((rowSector, i) => (
                            <tr key={rowSector}>
                                <td className="heatmap-row-label">{rowSector}</td>
                                {sectors.map((colSector, j) => {
                                    const val = matrix[i][j];
                                    const isHovered = hoveredCell &&
                                        hoveredCell.row === i && hoveredCell.col === j;
                                    return (
                                        <td
                                            key={`${i}-${j}`}
                                            className={`heatmap-cell ${isHovered ? 'hovered' : ''}`}
                                            style={{
                                                backgroundColor: getColor(val),
                                                color: getTextColor(val),
                                            }}
                                            onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            title={`${rowSector} vs ${colSector}: ${val.toFixed(2)} — ${getMeaning(val)}`}
                                        >
                                            {val.toFixed(2)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* What does this mean? */}
            <div className="heatmap-explanation">
                <h4><Info size={13} /> What does this mean?</h4>
                <ul>
                    <li><strong>Red/orange cells</strong> — These sectors tend to rise and fall together. Investing in both won't give you much protection.</li>
                    <li><strong>Gray cells</strong> — These sectors move independently. Good for diversification.</li>
                    <li><strong>Blue cells</strong> — These sectors tend to move in opposite directions. Great for balancing risk.</li>
                </ul>
            </div>

            {/* Sector stock lists */}
            <details className="sector-details">
                <summary>Which stocks are in each sector?</summary>
                <div className="sector-chips-grid">
                    {sectors.map(s => (
                        <div key={s} className="sector-group">
                            <span className="sector-name">{s}</span>
                            <span className="sector-members">
                                {(sector_stocks[s] || []).join(', ')}
                            </span>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
}
