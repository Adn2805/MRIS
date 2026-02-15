import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import NetworkGraph from './components/NetworkGraph';
import NodeInspector from './components/NodeInspector';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import InsightsPanel from './components/InsightsPanel';
import PortfolioChecker from './components/PortfolioChecker';
import LoadingOverlay from './components/LoadingOverlay';
import GuidedTour from './components/GuidedTour';
import { useAnalysis } from './hooks/useAnalysis';
import { Network, AlertCircle, HelpCircle, Share2, Briefcase } from 'lucide-react';

export default function App() {
    const {
        data, loading, error, indices,
        fetchIndices, analyze,
    } = useAnalysis();

    const [selectedIndex, setSelectedIndex] = useState('');
    const [period, setPeriod] = useState('3mo');
    const [threshold, setThreshold] = useState(0.6);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showTour, setShowTour] = useState(() => !localStorage.getItem('mris_tour_done'));
    const [activeTab, setActiveTab] = useState('network');

    useEffect(() => { fetchIndices(); }, [fetchIndices]);

    useEffect(() => {
        if (indices.length > 0 && !selectedIndex) {
            setSelectedIndex(indices[0].name);
        }
    }, [indices, selectedIndex]);

    const handleAnalyze = useCallback(() => {
        if (!selectedIndex) return;
        setSelectedNode(null);
        analyze({
            index: selectedIndex,
            period,
            threshold,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
    }, [selectedIndex, period, threshold, startDate, endDate, analyze]);

    const handleSelectNode = useCallback((node) => {
        setSelectedNode(node);
    }, []);

    return (
        <div className="app-layout">
            <div className="bg-grid" />

            {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

            <Header onShowGuide={() => setShowTour(true)} />

            <ControlPanel
                indices={indices}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                period={period}
                setPeriod={setPeriod}
                threshold={threshold}
                setThreshold={setThreshold}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onAnalyze={handleAnalyze}
                loading={loading}
            />

            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Two simple tabs */}
            <div className="view-tabs">
                <button
                    className={`view-tab ${activeTab === 'network' ? 'active' : ''}`}
                    onClick={() => setActiveTab('network')}
                    title="See which stocks move together"
                >
                    <Share2 size={14} />
                    <span className="tab-label">Stock Map</span>
                </button>
                <button
                    className={`view-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                    title="Check your stock mix"
                >
                    <Briefcase size={14} />
                    <span className="tab-label">My Portfolio</span>
                </button>
            </div>

            {/* ── Stock Map Tab ── */}
            {activeTab === 'network' && (
                <div className="app-body">
                    <div className="main-content">
                        {!data && !loading && (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Network size={32} />
                                </div>
                                <div className="empty-title">See How Stocks Are Connected</div>
                                <div className="empty-description">
                                    Think of this as a <strong>social network for stocks</strong>.
                                    <br /><br />
                                    <strong>How to use:</strong>
                                    <br />1. Pick a stock group above (e.g. NIFTY 50)
                                    <br />2. Choose how far back to look
                                    <br />3. Click <strong>Analyze Network</strong>
                                    <br /><br />
                                    <strong>Reading the graph:</strong>
                                    <br />• <strong>Bigger circle</strong> = more influential stock
                                    <br />• <strong>Same color</strong> = stocks that move together
                                    <br />• <strong>Lines between them</strong> = they're correlated
                                    <br />• <strong>Click any stock</strong> to see its details
                                </div>
                                <button className="tour-relaunch" onClick={() => setShowTour(true)}>
                                    <HelpCircle size={14} />
                                    Take the guided tour
                                </button>
                            </div>
                        )}

                        {data && (
                            <NetworkGraph
                                data={data}
                                selectedNode={selectedNode}
                                onSelectNode={handleSelectNode}
                            />
                        )}

                        {loading && !data && <LoadingOverlay />}

                        {selectedNode && data && (
                            <NodeInspector
                                node={selectedNode}
                                edges={data.edges}
                                onClose={() => setSelectedNode(null)}
                            />
                        )}
                    </div>

                    {/* Sidebar: Key Findings + Analytics */}
                    <div className="sidebar-wrapper">
                        {data && data.insights && data.insights.length > 0 && (
                            <InsightsPanel insights={data.insights} />
                        )}
                        <AnalyticsSidebar
                            data={data}
                            collapsed={sidebarCollapsed}
                            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                            onSelectNode={handleSelectNode}
                        />
                    </div>
                </div>
            )}

            {/* ── My Portfolio Tab ── */}
            {activeTab === 'portfolio' && (
                <div className="tab-content-area">
                    <PortfolioChecker />
                </div>
            )}
        </div>
    );
}
