/**
 * Cluster color palette — vibrant, accessible hues for dark backgrounds.
 * Each cluster gets a distinct, saturated color.
 */
const CLUSTER_COLORS = [
    '#3b82f6', // Blue
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#a78bfa', // Light Violet
    '#22d3ee', // Light Cyan
    '#fb923c', // Light Orange
];

export function getClusterColor(clusterId) {
    return CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
}

export default CLUSTER_COLORS;
