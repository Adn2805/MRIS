import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { getClusterColor } from '../utils/colors';

export default function NetworkGraph({ data, selectedNode, onSelectNode, isLive }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const simulationRef = useRef(null);
    const graphRef = useRef(null); // Store D3 selections for merge-based updates
    const prevDataRef = useRef(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });

    const destroySimulation = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.stop();
            simulationRef.current = null;
        }
    }, []);

    // Determine if we should do a merge update (live mode, same set of nodes)
    const shouldMerge = useCallback(() => {
        if (!isLive || !prevDataRef.current || !graphRef.current) return false;
        const prevIds = new Set(prevDataRef.current.nodes.map((n) => n.id));
        const currIds = new Set(data.nodes.map((n) => n.id));
        // Merge if mostly the same nodes (>80% overlap)
        const overlap = [...currIds].filter((id) => prevIds.has(id)).length;
        return overlap / Math.max(currIds.size, 1) > 0.8;
    }, [data, isLive]);

    // MERGE update: smoothly update existing graph without destroying it
    const mergeUpdate = useCallback(() => {
        const { nodeGroup, edgeGroup, simulation, edgeOpacity, edgeWidth, nodes: oldNodes, edges: oldEdges } = graphRef.current;

        // Build new node data, preserving positions from old nodes
        const oldNodeMap = new Map(oldNodes.map((n) => [n.id, n]));
        const newNodes = data.nodes.map((n) => {
            const old = oldNodeMap.get(n.id);
            return {
                ...n,
                color: getClusterColor(n.cluster_id),
                radius: Math.max(6, Math.min(28, 6 + n.influence_score * 24)),
                x: old ? old.x : undefined,
                y: old ? old.y : undefined,
                vx: old ? old.vx : undefined,
                vy: old ? old.vy : undefined,
            };
        });

        const nodeMap = new Map(newNodes.map((n) => [n.id, n]));
        const newEdges = data.edges
            .map((e) => ({ source: e.source, target: e.target, weight: e.weight }))
            .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target));

        // Update scales
        const maxWeight = d3.max(newEdges, (d) => d.weight) || 1;
        const newEdgeOpacity = d3.scaleLinear().domain([0, maxWeight]).range([0.08, 0.45]);
        const newEdgeWidth = d3.scaleLinear().domain([0, maxWeight]).range([0.5, 3.5]);

        // Update edges with enter/update/exit
        const edges = edgeGroup.data(newEdges, (d) =>
            `${typeof d.source === 'object' ? d.source.id : d.source}-${typeof d.target === 'object' ? d.target.id : d.target}`
        );

        edges.exit().transition().duration(300).attr('stroke-opacity', 0).remove();

        const edgesEnter = edges.enter()
            .append('line')
            .attr('class', 'graph-edge')
            .attr('stroke', '#4b6a9b')
            .attr('stroke-opacity', 0);

        const allEdges = edgesEnter.merge(edges);
        allEdges.transition().duration(500)
            .attr('stroke-width', (d) => newEdgeWidth(d.weight))
            .attr('stroke-opacity', (d) => newEdgeOpacity(d.weight));

        // Update nodes with transition
        const nodeGroupSel = graphRef.current.nodeGroupParent
            .selectAll('.graph-node')
            .data(newNodes, (d) => d.id);

        nodeGroupSel.exit().transition().duration(300).attr('opacity', 0).remove();

        // Update existing nodes
        nodeGroupSel.select('.graph-node-circle')
            .transition().duration(500)
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => d.color);

        nodeGroupSel.select('.node-glow')
            .transition().duration(500)
            .attr('r', (d) => d.radius + 5)
            .attr('fill', (d) => d.color);

        // Enter new nodes
        const nodeEnter = nodeGroupSel.enter()
            .append('g')
            .attr('class', 'graph-node')
            .attr('opacity', 0);

        nodeEnter.append('circle')
            .attr('r', (d) => d.radius + 5)
            .attr('fill', (d) => d.color)
            .attr('opacity', 0)
            .attr('class', 'node-glow');

        nodeEnter.append('circle')
            .attr('class', 'graph-node-circle')
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => d.color)
            .style('color', (d) => d.color);

        nodeEnter.append('text')
            .attr('class', 'graph-label')
            .attr('dy', (d) => d.radius + 14)
            .text((d) => d.symbol.replace('.NS', '').replace('.L', '').replace('.DE', '').replace('.HK', ''));

        nodeEnter.transition().duration(500).attr('opacity', 1);

        const allNodes = nodeEnter.merge(nodeGroupSel);

        // Re-apply interactions on all nodes
        allNodes
            .on('click', (event, d) => {
                event.stopPropagation();
                onSelectNode(d);
            })
            .on('mouseenter', (event, d) => {
                const [mx, my] = d3.pointer(event, containerRef.current);
                setTooltip({ visible: true, x: mx + 14, y: my - 10, node: d });
            })
            .on('mouseleave', () => {
                setTooltip({ visible: false, x: 0, y: 0, node: null });
            });

        allNodes.call(
            d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
        );

        // Update simulation
        simulation.nodes(newNodes);
        simulation.force('link').links(newEdges);
        simulation.alpha(0.3).restart();

        simulation.on('tick', () => {
            allEdges
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
            allNodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
        });

        // Update refs
        graphRef.current.nodes = newNodes;
        graphRef.current.edges = newEdges;
        graphRef.current.edgeGroup = allEdges;
        graphRef.current.edgeOpacity = newEdgeOpacity;
        graphRef.current.edgeWidth = newEdgeWidth;
        prevDataRef.current = data;
    }, [data, onSelectNode]);

    // FULL render: create the graph from scratch
    useEffect(() => {
        if (!data || !svgRef.current || !containerRef.current) return;

        // If we can merge, do it instead
        if (shouldMerge()) {
            mergeUpdate();
            return;
        }

        destroySimulation();

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes.map((n) => ({
            ...n,
            color: getClusterColor(n.cluster_id),
            radius: Math.max(6, Math.min(28, 6 + n.influence_score * 24)),
        }));

        const nodeMap = new Map(nodes.map((n) => [n.id, n]));
        const edges = data.edges
            .map((e) => ({ source: e.source, target: e.target, weight: e.weight }))
            .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target));

        const g = svg.append('g');
        const zoom = d3.zoom()
            .scaleExtent([0.2, 5])
            .on('zoom', (event) => g.attr('transform', event.transform));
        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

        const maxWeight = d3.max(edges, (d) => d.weight) || 1;
        const edgeOpacity = d3.scaleLinear().domain([0, maxWeight]).range([0.08, 0.45]);
        const edgeWidth = d3.scaleLinear().domain([0, maxWeight]).range([0.5, 3.5]);

        const edgeGroupParent = g.append('g').attr('class', 'edges');
        const edgeGroup = edgeGroupParent
            .selectAll('line')
            .data(edges)
            .join('line')
            .attr('class', 'graph-edge')
            .attr('stroke', '#4b6a9b')
            .attr('stroke-width', (d) => edgeWidth(d.weight))
            .attr('stroke-opacity', (d) => edgeOpacity(d.weight));

        const nodeGroupParent = g.append('g').attr('class', 'nodes');
        const nodeGroup = nodeGroupParent
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', (d) =>
                `graph-node ${selectedNode && selectedNode.id === d.id ? 'selected' : ''}`
            );

        nodeGroup.append('circle')
            .attr('r', (d) => d.radius + 5)
            .attr('fill', (d) => d.color)
            .attr('opacity', 0)
            .attr('class', 'node-glow');

        nodeGroup.append('circle')
            .attr('class', 'graph-node-circle')
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => d.color)
            .style('color', (d) => d.color);

        nodeGroup.append('text')
            .attr('class', 'graph-label')
            .attr('dy', (d) => d.radius + 14)
            .text((d) => d.symbol.replace('.NS', '').replace('.L', '').replace('.DE', '').replace('.HK', ''));

        nodeGroup
            .on('click', (event, d) => {
                event.stopPropagation();
                onSelectNode(d);
            })
            .on('mouseenter', (event, d) => {
                const [mx, my] = d3.pointer(event, container);
                setTooltip({ visible: true, x: mx + 14, y: my - 10, node: d });

                edgeGroup
                    .attr('stroke-opacity', (e) =>
                        e.source.id === d.id || e.target.id === d.id
                            ? 0.8
                            : edgeOpacity(e.weight) * 0.3
                    )
                    .attr('stroke', (e) =>
                        e.source.id === d.id || e.target.id === d.id ? d.color : '#4b6a9b'
                    );

                const connectedIds = new Set([d.id]);
                edges.forEach((e) => {
                    const sid = typeof e.source === 'object' ? e.source.id : e.source;
                    const tid = typeof e.target === 'object' ? e.target.id : e.target;
                    if (sid === d.id) connectedIds.add(tid);
                    if (tid === d.id) connectedIds.add(sid);
                });

                nodeGroup.attr('opacity', (n) => (connectedIds.has(n.id) ? 1 : 0.2));

                d3.select(event.currentTarget)
                    .select('.node-glow')
                    .transition().duration(200).attr('opacity', 0.15);
            })
            .on('mouseleave', () => {
                setTooltip({ visible: false, x: 0, y: 0, node: null });
                edgeGroup
                    .attr('stroke-opacity', (d) => edgeOpacity(d.weight))
                    .attr('stroke', '#4b6a9b');
                nodeGroup.attr('opacity', 1);
                nodeGroup.selectAll('.node-glow').transition().duration(200).attr('opacity', 0);
            });

        svg.on('click', () => onSelectNode(null));

        const drag = d3.drag()
            .on('start', (event, d) => {
                if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => {
                if (!event.active) simulationRef.current.alphaTarget(0);
                d.fx = null; d.fy = null;
            });

        nodeGroup.call(drag);

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id((d) => d.id).distance(100).strength((d) => d.weight * 0.3))
            .force('charge', d3.forceManyBody().strength(-200).distanceMax(400))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius((d) => d.radius + 6))
            .force('x', d3.forceX(0).strength(0.04))
            .force('y', d3.forceY(0).strength(0.04))
            .alpha(1)
            .alphaDecay(0.02)
            .on('tick', () => {
                edgeGroup
                    .attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y)
                    .attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y);
                nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
            });

        simulationRef.current = simulation;

        // Store refs for merge updates
        graphRef.current = {
            nodeGroup,
            nodeGroupParent,
            edgeGroup,
            edgeGroupParent,
            simulation,
            edgeOpacity,
            edgeWidth,
            nodes,
            edges,
        };
        prevDataRef.current = data;

        // Entrance animation
        nodeGroup.selectAll('.graph-node-circle')
            .attr('r', 0)
            .transition().duration(600).delay((d, i) => i * 15)
            .ease(d3.easeCubicOut).attr('r', (d) => d.radius);

        nodeGroup.selectAll('.graph-label')
            .attr('opacity', 0)
            .transition().duration(400).delay((d, i) => 300 + i * 15)
            .attr('opacity', 1);

        edgeGroup.attr('stroke-opacity', 0)
            .transition().duration(800).delay(200)
            .attr('stroke-opacity', (d) => edgeOpacity(d.weight));

        return () => destroySimulation();
    }, [data, destroySimulation, onSelectNode, selectedNode, shouldMerge, mergeUpdate]);

    return (
        <div className="graph-container" ref={containerRef}>
            <svg ref={svgRef} />
            {tooltip.visible && tooltip.node && (
                <div
                    className="graph-tooltip visible"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="tooltip-symbol">{tooltip.node.symbol}</div>
                    <div className="tooltip-metric">
                        Influence: {(tooltip.node.influence_score * 100).toFixed(1)}%
                    </div>
                    <div className="tooltip-metric">
                        Connections: {tooltip.node.connections}
                    </div>
                </div>
            )}
            {isLive && (
                <div className="live-graph-indicator">
                    <div className="live-pulse" />
                    <span>Streaming</span>
                </div>
            )}
        </div>
    );
}
