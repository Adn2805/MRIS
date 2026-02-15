import React from 'react';
import { ChevronRight, ChevronLeft, BarChart3, Network, Layers } from 'lucide-react';
import { getClusterColor } from '../utils/colors';

export default function AnalyticsSidebar({ data, collapsed, onToggle, onSelectNode }) {
    if (!data) return null;

    const { nodes, stats, clusters } = data;
    const topInfluencers = nodes.slice(0, 10);
    const maxScore = topInfluencers.length > 0 ? topInfluencers[0].influence_score : 1;

    return (
        <>
            <button
                className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
                onClick={onToggle}
                style={collapsed ? { right: 0 } : {}}
            >
                {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>

            <aside className={`analytics-sidebar ${collapsed ? 'collapsed' : ''}`}>
                {/* Network Stats */}
                <div className="analytics-section">
                    <div className="section-header">
                        <span className="section-title">
                            <Network size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                            Network Stats
                        </span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.total_nodes}</div>
                            <div className="stat-label">Nodes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.total_edges}</div>
                            <div className="stat-label">Edges</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.density.toFixed(3)}</div>
                            <div className="stat-label">Density</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.avg_degree.toFixed(1)}</div>
                            <div className="stat-label">Avg Degree</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.modularity.toFixed(3)}</div>
                            <div className="stat-label">Modularity</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.num_clusters}</div>
                            <div className="stat-label">Clusters</div>
                        </div>
                    </div>
                </div>

                {/* Clusters */}
                <div className="analytics-section">
                    <div className="section-header">
                        <span className="section-title">
                            <Layers size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                            Clusters
                        </span>
                        <span className="section-badge">{clusters.length}</span>
                    </div>
                    <div className="cluster-chips">
                        {clusters.map((c) => (
                            <div key={c.cluster_id} className="cluster-chip">
                                <div
                                    className="cluster-dot"
                                    style={{ background: getClusterColor(c.cluster_id) }}
                                />
                                <span>{c.size} stocks</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Influencers */}
                <div className="analytics-section">
                    <div className="section-header">
                        <span className="section-title">
                            <BarChart3 size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                            Top Influencers
                        </span>
                        <span className="section-badge">Top 10</span>
                    </div>
                    <div className="influencer-list">
                        {topInfluencers.map((node, index) => {
                            const color = getClusterColor(node.cluster_id);
                            const barWidth = maxScore > 0 ? (node.influence_score / maxScore) * 100 : 0;
                            return (
                                <div
                                    key={node.id}
                                    className="influencer-item"
                                    onClick={() => onSelectNode(node)}
                                >
                                    <span className="influencer-rank">{index + 1}</span>
                                    <div className="influencer-dot" style={{ background: color }} />
                                    <span className="influencer-name">
                                        {node.symbol.replace('.NS', '').replace('.L', '').replace('.DE', '').replace('.HK', '')}
                                    </span>
                                    <div className="influencer-bar-container">
                                        <div
                                            className="influencer-bar"
                                            style={{ width: `${barWidth}%`, background: color }}
                                        />
                                    </div>
                                    <span className="influencer-score">
                                        {(node.influence_score * 100).toFixed(0)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </>
    );
}
