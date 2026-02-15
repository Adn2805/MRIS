import React from 'react';
import { X } from 'lucide-react';
import { getClusterColor } from '../utils/colors';
import { InfoTooltip } from './GuidedTour';

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

    // Beginner-friendly influence description
    const getInfluenceDesc = (score) => {
        if (score >= 0.7) return 'Very influential — this stock is heavily connected to many others';
        if (score >= 0.4) return 'Moderately influential in the network';
        return 'Lower influence — fewer connections to other stocks';
    };

    return (
        <div className="node-inspector">
            <div className="inspector-header">
                <div className="inspector-symbol" style={{ color: clusterColor }}>
                    {node.symbol}
                </div>
                <button className="inspector-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Influence bar */}
            <div className="inspector-influence">
                <span className="influence-label">
                    Market Influence
                    <InfoTooltip text="How connected and central this stock is in the market network. Higher = more influence on the overall market." />
                </span>
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
            <p className="inspector-hint">{getInfluenceDesc(node.influence_score)}</p>

            {/* Centrality metrics with explanations */}
            <div className="inspector-metrics">
                <div className="metric-box" title="How many connections this stock has">
                    <div className="metric-value">{node.centrality.degree.toFixed(3)}</div>
                    <div className="metric-label">Connections</div>
                </div>
                <div className="metric-box" title="How often this stock sits between other stocks' connections">
                    <div className="metric-value">{node.centrality.betweenness.toFixed(3)}</div>
                    <div className="metric-label">Bridge Role</div>
                </div>
                <div className="metric-box" title="How quickly this stock can reach all other stocks in the network">
                    <div className="metric-value">{node.centrality.closeness.toFixed(3)}</div>
                    <div className="metric-label">Reach</div>
                </div>
            </div>

            {/* Top connections */}
            {connections.length > 0 && (
                <>
                    <div className="inspector-connections-title">
                        Most Correlated Stocks ({connections.length})
                    </div>
                    <p className="inspector-connections-hint">
                        These stocks tend to move in the same direction
                    </p>
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
