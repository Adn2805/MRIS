import React, { useState } from 'react';
import { Grid3x3, Info } from 'lucide-react';

export default function SectorHeatmap({ sectorData }) {
    const [hoveredCell, setHoveredCell] = useState(null);

    if (!sectorData || !sectorData.sectors || sectorData.sectors.length < 2) {
        return (
            <div className="sector-heatmap empty-heatmap">
                <Grid3x3 size={24} />
                <p>Sector heatmap will appear after running an analysis.</p>
            </div>
        );
    }

    const { sectors, matrix, sector_stocks } = sectorData;

    const getColor = (val) => {
        // -1 (blue) to 0 (gray) to 1 (red/orange)
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

    return (
        <div className="sector-heatmap">
            <div className="heatmap-header">
                <Grid3x3 size={18} />
                <h3>Sector Correlation Heatmap</h3>
            </div>
            <p className="heatmap-desc">
                Shows how different market sectors correlate with each other.
                <strong> Red = move together</strong>, <strong>Blue = move apart</strong>,
                <strong> Gray = independent</strong>.
            </p>

            {/* Legend */}
            <div className="heatmap-legend">
                <span className="legend-label">-1.0 (Opposite)</span>
                <div className="legend-gradient"></div>
                <span className="legend-label">+1.0 (Together)</span>
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
                                        >
                                            {val.toFixed(2)}
                                            {isHovered && (
                                                <div className="heatmap-tooltip">
                                                    <strong>{rowSector} × {colSector}</strong>
                                                    <br />Correlation: {val.toFixed(3)}
                                                    <br />
                                                    {i === j ? (
                                                        <span className="tooltip-detail">
                                                            Stocks: {(sector_stocks[rowSector] || []).join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className="tooltip-detail">
                                                            {val > 0.5 ? 'Strong positive — move together' :
                                                                val > 0.2 ? 'Moderate correlation' :
                                                                    val > -0.2 ? 'Weak / independent' :
                                                                        'Negative — tend to move apart'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sector stock lists */}
            <div className="sector-lists">
                <h4><Info size={14} /> Sector Composition</h4>
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
            </div>
        </div>
    );
}
