"""
Insights Generator Module
Produces plain-English insights from network analysis results.
Purely rule-based — no external AI APIs needed.
"""

import logging

logger = logging.getLogger(__name__)


def generate_insights(nodes, edges, clusters, stats, index_name):
    """
    Generate a list of beginner-friendly insight strings from analysis data.

    Args:
        nodes: list of node dicts (sorted by influence_score descending)
        edges: list of edge dicts
        clusters: list of cluster dicts
        stats: network stats dict
        index_name: name of the index being analyzed

    Returns:
        list of insight dicts with {priority, text}
    """
    insights = []

    if not nodes:
        return [{"priority": "info", "text": "No data available to generate insights."}]

    # ── 1. Most Influential Stock ──────────────────────────────────
    top = nodes[0]
    symbol = _clean(top["symbol"])
    score = top["influence_score"]
    conns = top["connections"]
    insights.append({
        "priority": "critical",
        "text": (
            f"**{symbol}** is the most influential stock in {index_name}, "
            f"connected to {conns} other stocks with an influence score of "
            f"{score * 100:.0f}%. When {symbol} moves, many others follow."
        ),
    })

    # ── 2. Top 3 Power Players ─────────────────────────────────────
    if len(nodes) >= 3:
        top3 = [_clean(n["symbol"]) for n in nodes[:3]]
        insights.append({
            "priority": "high",
            "text": (
                f"The top 3 most connected stocks are **{top3[0]}**, "
                f"**{top3[1]}**, and **{top3[2]}**. Together, they form the "
                f"backbone of the {index_name} network."
            ),
        })

    # ── 3. Market Density / Health ─────────────────────────────────
    density = stats["density"]
    if density >= 0.5:
        insights.append({
            "priority": "critical",
            "text": (
                f"**High market correlation** (density: {density:.2f}). "
                f"Most stocks are moving together — this often happens during "
                f"market stress or strong trends. Diversification is harder right now."
            ),
        })
    elif density >= 0.2:
        insights.append({
            "priority": "medium",
            "text": (
                f"**Moderate market correlation** (density: {density:.2f}). "
                f"Some stocks move independently while others are linked. "
                f"Good conditions for building a diversified portfolio."
            ),
        })
    else:
        insights.append({
            "priority": "low",
            "text": (
                f"**Low market correlation** (density: {density:.2f}). "
                f"Stocks are moving quite independently — great for diversification. "
                f"Each stock is driven more by its own fundamentals."
            ),
        })

    # ── 4. Cluster Analysis ────────────────────────────────────────
    num_clusters = len(clusters)
    if num_clusters > 0:
        largest = max(clusters, key=lambda c: c["size"])
        largest_members = [_clean(m) for m in largest["members"][:5]]
        member_str = ", ".join(largest_members)
        if len(largest["members"]) > 5:
            member_str += f" and {len(largest['members']) - 5} more"

        insights.append({
            "priority": "medium",
            "text": (
                f"The market splits into **{num_clusters} distinct groups**. "
                f"The largest group has {largest['size']} stocks including "
                f"{member_str}. Stocks in the same group tend to move together."
            ),
        })

    # ── 5. Strongest Connection ────────────────────────────────────
    if edges:
        strongest = max(edges, key=lambda e: abs(e["weight"]))
        s1 = _clean(strongest["source"])
        s2 = _clean(strongest["target"])
        w = abs(strongest["weight"])
        insights.append({
            "priority": "high",
            "text": (
                f"The strongest connection is between **{s1}** and **{s2}** "
                f"(correlation: {w:.3f}). These two stocks move almost in lockstep."
            ),
        })

    # ── 6. Isolated Stocks ─────────────────────────────────────────
    isolated = [n for n in nodes if n["connections"] <= 1]
    if isolated:
        iso_names = [_clean(n["symbol"]) for n in isolated[:3]]
        verb = "is" if len(iso_names) == 1 else "are"
        pron = "it moves" if len(iso_names) == 1 else "they move"
        pron2 = "it" if len(iso_names) == 1 else "them"
        insights.append({
            "priority": "low",
            "text": (
                f"{', '.join(iso_names)} {verb} relatively independent — "
                f"{pron} on their own, making {pron2} good diversification candidates."
            ),
        })

    # ── 7. Network Size Summary ────────────────────────────────────
    insights.append({
        "priority": "info",
        "text": (
            f"Analyzing **{stats['total_nodes']} stocks** with "
            f"**{stats['total_edges']} connections** found above your threshold. "
            f"Each stock has an average of {stats['avg_degree']:.1f} connections."
        ),
    })

    logger.info(f"Generated {len(insights)} insights")
    return insights


def _clean(symbol):
    """Remove exchange suffixes from ticker symbols for display."""
    for suffix in [".NS", ".L", ".DE", ".HK", ".BO"]:
        symbol = symbol.replace(suffix, "")
    return symbol
