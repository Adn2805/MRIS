import React from 'react';
import { X } from 'lucide-react';
import { getClusterColor } from '../utils/colors';

export default function NodeInspector({ node, edges, onClose }) {
    if (!node) return null;

    // Find connections for this node, sorted by weight
    const connections = edges
        .filter((e) => e.source === node.id || e.target === node.id)
        .map((e) => ({
            peer: e.source === node.id ? e.target : e.source,
            weight: e.weight,
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10);

    const maxWeight = connections.length > 0 ? connections[0].weight : 1;
    const clusterColor = getClusterColor(node.cluster_id);

    return (
        <div className="node-inspector">
            <div className="inspector-header">
                <div
                    className="inspector-symbol"
                    style={{ color: clusterColor }}
                >
                    {node.symbol}
                </div>
                <button className="inspector-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Influence bar */}
            <div className="inspector-influence">
                <span className="influence-label">Influence</span>
                <span className="influence-value" style={{ color: clusterColor }}>
                    {(node.influence_score * 100).toFixed(1)}%
                </span>
                <div className="influence-bar-track">
                    <div
                        className="influence-bar-fill"
                        style={{ width: `${node.influence_score * 100}%` }}
                    />
                </div>
            </div>

            {/* Centrality metrics */}
            <div className="inspector-metrics">
                <div className="metric-box">
                    <div className="metric-value">{node.centrality.degree.toFixed(3)}</div>
                    <div className="metric-label">Degree</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value">{node.centrality.betweenness.toFixed(3)}</div>
                    <div className="metric-label">Between.</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value">{node.centrality.closeness.toFixed(3)}</div>
                    <div className="metric-label">Closeness</div>
                </div>
            </div>

            {/* Top connections */}
            {connections.length > 0 && (
                <>
                    <div className="inspector-connections-title">
                        Top Connections ({connections.length})
                    </div>
                    {connections.map((c) => (
                        <div key={c.peer} className="connection-item">
                            <span className="connection-name">
                                {c.peer.replace('.NS', '').replace('.L', '').replace('.DE', '').replace('.HK', '')}
                            </span>
                            <div className="connection-bar">
                                <div
                                    className="connection-bar-fill"
                                    style={{ width: `${(c.weight / maxWeight) * 100}%` }}
                                />
                            </div>
                            <span className="connection-weight">{c.weight.toFixed(3)}</span>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
