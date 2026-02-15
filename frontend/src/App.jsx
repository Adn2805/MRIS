import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import NetworkGraph from './components/NetworkGraph';
import NodeInspector from './components/NodeInspector';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import LoadingOverlay from './components/LoadingOverlay';
import { useAnalysis } from './hooks/useAnalysis';
import { Network, AlertCircle } from 'lucide-react';

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

    return (
        <div className="app-layout">
            <div className="bg-grid" />

            <Header isLive={isLive} lastUpdated={lastUpdated} />

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

            <div className="app-body">
                <div className="main-content">
                    {!data && !loading && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Network size={32} />
                            </div>
                            <div className="empty-title">Market Network Explorer</div>
                            <div className="empty-description">
                                Select a stock index, configure your parameters, and click
                                <strong> Analyze</strong> for a one-time analysis or
                                <strong> Go Live</strong> for real-time streaming updates.
                            </div>
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

                <AnalyticsSidebar
                    data={data}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onSelectNode={handleSelectNode}
                />
            </div>
        </div>
    );
}
