import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import NetworkGraph from './components/NetworkGraph';
import NodeInspector from './components/NodeInspector';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import InsightsPanel from './components/InsightsPanel';
import SectorHeatmap from './components/SectorHeatmap';
import PortfolioChecker from './components/PortfolioChecker';
import LoadingOverlay from './components/LoadingOverlay';
import GuidedTour from './components/GuidedTour';
import { useAnalysis } from './hooks/useAnalysis';
import { Network, AlertCircle, HelpCircle, Share2, Grid3x3, Briefcase } from 'lucide-react';

export default function App() {
    const {
        data, loading, error, indices, isLive, lastUpdated,
        fetchIndices, analyze, startLive, stopLive,
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

    // Keep lastUpdated ticking for the header display
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isLive) return;
        const iv = setInterval(() => setTick((t) => t + 1), 5000);
        return () => clearInterval(iv);
    }, [isLive]);

    // Fetch available indices on mount
    useEffect(() => {
        fetchIndices();
    }, [fetchIndices]);

    // Default to first index once loaded
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

    const handleStartLive = useCallback(() => {
        if (!selectedIndex) return;
        setSelectedNode(null);
        startLive({
            index: selectedIndex,
            period,
            threshold,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            interval: 120,
        });
    }, [selectedIndex, period, threshold, startDate, endDate, startLive]);

    const handleSelectNode = useCallback((node) => {
        setSelectedNode(node);
    }, []);

    const TAB_CONFIG = [
        {
            id: 'network',
            icon: <Share2 size={14} />,
            label: 'Stock Map',
            hint: 'See which stocks move together',
        },
        {
            id: 'heatmap',
            icon: <Grid3x3 size={14} />,
            label: 'Sectors',
            hint: 'Compare industry sectors',
        },
        {
            id: 'portfolio',
            icon: <Briefcase size={14} />,
            label: 'My Portfolio',
            hint: 'Check your stock mix',
        },
    ];

    return (
        <div className="app-layout">
            <div className="bg-grid" />

            {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

            <Header isLive={isLive} lastUpdated={lastUpdated} onShowGuide={() => setShowTour(true)} />

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
                onStartLive={handleStartLive}
                onStopLive={stopLive}
                loading={loading}
                isLive={isLive}
            />

            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Tabs — simple and clear */}
            <div className="view-tabs">
                {TAB_CONFIG.map(tab => (
                    <button
                        key={tab.id}
                        className={`view-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.hint}
                    >
                        {tab.icon}
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
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
                                    <strong>How to read the graph:</strong>
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
                                isLive={isLive}
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

                    {/* Sidebar with insights built in */}
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

            {/* ── Sectors Tab ── */}
            {activeTab === 'heatmap' && (
                <div className="tab-content-area">
                    {!data ? (
                        <div className="tab-empty-hint">
                            <Grid3x3 size={28} />
                            <h3>Sector comparison will appear here</h3>
                            <p>First, go to the <strong>Stock Map</strong> tab and click <strong>Analyze Network</strong>. Then come back here to see how different sectors (Banking, IT, etc.) relate to each other.</p>
                        </div>
                    ) : (
                        <SectorHeatmap sectorData={data?.sector_heatmap} />
                    )}
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
