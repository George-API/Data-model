// Placeholder for transforming parsed schema data into graph data (nodes and edges)
// Use path alias for type imports
import { SchemaNode, GraphNode, GraphEdge, SchemaDomain } from '@/lib/types/schema';

// Dagre-style layout implementation
interface LayoutNode {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  rank?: number;
  domain?: SchemaDomain;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// Domain-based node categorization
function determineDomain(node: SchemaNode): SchemaDomain {
  // Real implementation would analyze node content and determine domain
  const name = node.name.toLowerCase();
  const type = node.type.toLowerCase();
  
  // Categorize based on naming patterns
  if (name.includes('store') || name.includes('state') || name.includes('provider')) {
    return 'State Management';
  }
  
  if (name.includes('service') || name.includes('api') || name.includes('client') || 
      name.includes('data') || name.includes('repository') || name.includes('query')) {
    return 'Data Handling';
  }
  
  if (name.includes('auth') || name.includes('user') || name.includes('permission') || 
      name.includes('role') || name.includes('security')) {
    return 'Auth';
  }
  
  if (name.includes('component') || name.includes('page') || 
      name.includes('layout') || name.includes('context') || 
      name.includes('provider') || name.includes('hook')) {
    return 'Architecture';
  }
  
  // Additional heuristics based on node type and properties
  if (type === 'interface' && node.properties && 
      node.properties.some(p => p.name.includes('component') || p.name.includes('element'))) {
    return 'Architecture';
  }
  
  if (node.methods && node.methods.some(m => 
      m.name.includes('fetch') || m.name.includes('get') || m.name.includes('post'))) {
    return 'Data Handling';
  }
  
  return 'Uncategorized';
}

// Calculate node dimensions based on content
function calculateNodeDimensions(node: SchemaNode): { width: number, height: number } {
  // Base dimensions
  let width = 180;
  let height = 100;
  
  // Scale based on complexity
  const propertyCount = node.properties?.length || 0;
  const methodCount = node.methods?.length || 0;
  const complexityFactor = propertyCount + methodCount * 1.5;
  
  // Apply scaling with limits
  width += Math.min(complexityFactor * 2, 70);
  height += Math.min(complexityFactor * 1.5, 60);
  
  return { width, height };
}

// Simplified hierarchical layout algorithm
function createHierarchicalLayout(nodes: LayoutNode[], edges: LayoutEdge[]): LayoutNode[] {
  // Create a map of node IDs to their nodes for quick lookups
  const nodeMap = new Map<string, LayoutNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Step 1: Calculate node ranks (levels in hierarchy)
  const ranks = new Map<string, number>();
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  // Build adjacency list for each node
  const outgoingEdges = new Map<string, string[]>();
  const incomingEdges = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, []);
    }
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    outgoingEdges.get(edge.source)!.push(edge.target);
    incomingEdges.get(edge.target)!.push(edge.source);
  });
  
  // Find roots (nodes with no incoming edges)
  const rootNodes: string[] = [];
  nodes.forEach(node => {
    if (!incomingEdges.has(node.id) || incomingEdges.get(node.id)!.length === 0) {
      rootNodes.push(node.id);
    }
  });
  
  // Assign initial ranks with depth-first traversal
  function assignRank(nodeId: string, currentRank: number): void {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      // Detected cycle, break it
      return;
    }
    
    visiting.add(nodeId);
    ranks.set(nodeId, Math.max(currentRank, ranks.get(nodeId) || 0));
    
    // Traverse children
    if (outgoingEdges.has(nodeId)) {
      outgoingEdges.get(nodeId)!.forEach(targetId => {
        assignRank(targetId, currentRank + 1);
      });
    }
    
    visiting.delete(nodeId);
    visited.add(nodeId);
  }
  
  // Start rank assignment from all root nodes
  rootNodes.forEach(rootId => {
    assignRank(rootId, 0);
  });
  
  // Handle nodes not connected to roots
  nodes.forEach(node => {
    if (!ranks.has(node.id)) {
      assignRank(node.id, 0);
    }
  });
  
  // Step 2: Optimize the layout - distribute nodes more evenly
  const domainGroups = new Map<SchemaDomain, LayoutNode[]>();
  
  // Group nodes by domain
  nodes.forEach(node => {
    const domain = node.domain || 'Uncategorized';
    if (!domainGroups.has(domain)) {
      domainGroups.set(domain, []);
    }
    domainGroups.get(domain)!.push(node);
    node.rank = ranks.get(node.id) || 0;
  });
  
  // Find max rank for scaling
  let maxRank = 0;
  ranks.forEach(rank => {
    maxRank = Math.max(maxRank, rank);
  });
  
  // Step 3: Calculate domain positions using a grid-based approach
  const DOMAINS_PER_ROW = 2; // Adjust based on how many domains you want per row
  const DOMAIN_PADDING = 150; // Padding between domains
  const NODE_SPACING = 40; // Space between nodes
  
  // Calculate grid position for domains
  let domainPosX = 0;
  let domainPosY = 0;
  let rowHeight = 0;
  let domainIndex = 0;
  
  // Sort domains by size (number of nodes) to prioritize larger ones
  const sortedDomains = Array.from(domainGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  // Position nodes within each domain
  sortedDomains.forEach(([, domainNodes]) => {
    if (domainNodes.length === 0) return;
    
    // Calculate this domain's grid position
    if (domainIndex % DOMAINS_PER_ROW === 0 && domainIndex > 0) {
      domainPosX = 0;
      domainPosY += rowHeight + DOMAIN_PADDING;
      rowHeight = 0;
    }
    
    // Measure domain nodes to determine sizing
    let maxNodeWidth = 0;
    let maxNodeHeight = 0;
    
    domainNodes.forEach(node => {
      maxNodeWidth = Math.max(maxNodeWidth, node.width);
      maxNodeHeight = Math.max(maxNodeHeight, node.height);
    });
    
    // Calculate a reasonable size for the domain based on number of nodes
    // Try to create a balanced aspect ratio for each domain
    const nodeCount = domainNodes.length;
    const ASPECT_RATIO = 0.8; // Vertical emphasis (smaller than 1)
    
    // For small domains, use a simple grid
    let columns = Math.ceil(Math.sqrt(nodeCount) * ASPECT_RATIO);
    let rows = Math.ceil(nodeCount / columns);
    
    // For large domains, adjust based on rank distribution
    if (nodeCount > 10) {
      // Count nodes per rank within this domain
      const rankCounts = new Map<number, number>();
      domainNodes.forEach(node => {
        const rank = node.rank || 0;
        rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
      });
      
      // Use the number of ranks as a guide for columns
      columns = Math.min(columns, Math.max(2, rankCounts.size));
      rows = Math.ceil(nodeCount / columns);
    }
    
    // Calculate domain dimensions
    const domainWidth = columns * (maxNodeWidth + NODE_SPACING) + NODE_SPACING;
    const domainHeight = rows * (maxNodeHeight + NODE_SPACING) + NODE_SPACING;
    rowHeight = Math.max(rowHeight, domainHeight);
    
    // Sort nodes within domain by rank and connections
    domainNodes.sort((a, b) => {
      // First by rank
      const rankDiff = (a.rank || 0) - (b.rank || 0);
      if (rankDiff !== 0) return rankDiff;
      
      // Then by number of connections
      const aConnections = (outgoingEdges.get(a.id)?.length || 0) + (incomingEdges.get(a.id)?.length || 0);
      const bConnections = (outgoingEdges.get(b.id)?.length || 0) + (incomingEdges.get(b.id)?.length || 0);
      return bConnections - aConnections;
    });
    
    // Position nodes in a grid pattern with rank influence
    let col = 0;
    let row = 0;
    let currentRank = -1;
    
    domainNodes.forEach(node => {
      // If rank changes, try to start a new row when possible
      if (node.rank !== currentRank && currentRank !== -1 && col > 0) {
        col = 0;
        row++;
      }
      currentRank = node.rank || 0;
      
      // Calculate position
      node.x = domainPosX + NODE_SPACING + col * (maxNodeWidth + NODE_SPACING) + node.width / 2;
      node.y = domainPosY + NODE_SPACING + row * (maxNodeHeight + NODE_SPACING) + node.height / 2;
      
      // Move to next position
      col++;
      if (col >= columns) {
        col = 0;
        row++;
      }
    });
    
    // Update domain position for next domain
    domainPosX += domainWidth + DOMAIN_PADDING;
    domainIndex++;
  });
  
  // Step 4: Apply force-directed adjustments to reduce edge crossings
  applyForceDirectedAdjustments(nodes, edges, 5); // 5 iterations
  
  return nodes;
}

// Apply force-directed adjustments to improve edge crossings
function applyForceDirectedAdjustments(nodes: LayoutNode[], edges: LayoutEdge[], iterations: number): void {
  const nodeMap = new Map<string, LayoutNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Group nodes by domain for more efficient force calculation
  const domainGroups = new Map<SchemaDomain, LayoutNode[]>();
  nodes.forEach(node => {
    const domain = node.domain || 'Uncategorized';
    if (!domainGroups.has(domain)) {
      domainGroups.set(domain, []);
    }
    domainGroups.get(domain)!.push(node);
  });
  
  // Perform several iterations of force-directed adjustments
  for (let iteration = 0; iteration < iterations; iteration++) {
    // Calculate forces for each node
    const forces = new Map<string, { dx: number, dy: number }>();
    nodes.forEach(node => forces.set(node.id, { dx: 0, dy: 0 }));
    
    // Edge attraction forces - pull connected nodes closer
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Skip if nodes are in different domains - preserve domain grouping
      if (sourceNode.domain !== targetNode.domain) return;
      
      const dx = targetNode.x! - sourceNode.x!;
      const dy = targetNode.y! - sourceNode.y!;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return;
      
      // Attraction force
      const force = (distance - 150) / 10; // Ideal distance is 150
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      
      // Apply attraction force
      forces.get(sourceNode.id)!.dx += fx;
      forces.get(sourceNode.id)!.dy += fy;
      forces.get(targetNode.id)!.dx -= fx;
      forces.get(targetNode.id)!.dy -= fy;
    });
    
    // Node repulsion forces - only calculate within each domain for efficiency
    domainGroups.forEach(domainNodes => {
      // Skip small domains with few nodes
      if (domainNodes.length <= 3) return;
      
      // Use spatial grid for more efficient nearest-neighbor calculation
      const cellSize = 200; // Size of each grid cell
      const grid = new Map<string, LayoutNode[]>();
      
      // Place nodes in grid cells
      domainNodes.forEach(node => {
        if (!node.x || !node.y) return;
        
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        const cellKey = `${cellX},${cellY}`;
        
        if (!grid.has(cellKey)) {
          grid.set(cellKey, []);
        }
        
        grid.get(cellKey)!.push(node);
      });
      
      // For each node, only check repulsion with nodes in nearby grid cells
      domainNodes.forEach(node1 => {
        if (!node1.x || !node1.y) return;
        
        const cellX = Math.floor(node1.x / cellSize);
        const cellY = Math.floor(node1.y / cellSize);
        
        // Check 9 neighboring cells (including this cell)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborCellKey = `${cellX + dx},${cellY + dy}`;
            const nodesInCell = grid.get(neighborCellKey) || [];
            
            // Check repulsion with each node in this cell
            nodesInCell.forEach(node2 => {
              // Skip self
              if (node1.id === node2.id) return;
              
              const dx = node2.x! - node1.x!;
              const dy = node2.y! - node1.y!;
              const distSq = dx * dx + dy * dy; // Square of distance (avoid sqrt for performance)
              
              // Early escape for nodes that are far apart
              const minDistSq = (node1.width / 2 + node2.width / 2 + 20) ** 2;
              if (distSq >= minDistSq) return;
              
              // Calculate repulsion force
              const distance = Math.sqrt(distSq); // Now use sqrt only when needed
              if (distance === 0) return;
              
              const force = (minDistSq / distSq - 1);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              // Apply repulsion force with decreased intensity per iteration
              const dampingFactor = 1 - (iteration / iterations) * 0.3;
              forces.get(node1.id)!.dx -= fx * dampingFactor;
              forces.get(node1.id)!.dy -= fy * dampingFactor;
            });
          }
        }
      });
    });
    
    // Apply calculated forces with dampening
    const DAMPING = 0.3;
    nodes.forEach(node => {
      const force = forces.get(node.id);
      if (force) {
        node.x! += force.dx * DAMPING;
        node.y! += force.dy * DAMPING;
      }
    });
  }
}

// Determine if an edge crosses domains
function isEdgeCrossingDomains(edge: GraphEdge, nodes: Map<string, GraphNode>): boolean {
  const sourceNode = nodes.get(edge.source);
  const targetNode = nodes.get(edge.target);
  
  if (!sourceNode || !targetNode) return false;
  
  return sourceNode.data.domain !== targetNode.data.domain;
}

// Main transformation function
export function transformSchemaToGraph(schemaNodes: SchemaNode[]): { nodes: GraphNode[], edges: GraphEdge[] } {
  if (!schemaNodes || schemaNodes.length === 0) {
    return { nodes: [], edges: [] };
  }
  
  const layoutNodes: LayoutNode[] = [];
  const layoutEdges: LayoutEdge[] = [];
  
  // Assign domains and prepare layout nodes
  schemaNodes.forEach(schemaNode => {
    // Determine domain for the node
    const domain = determineDomain(schemaNode);
    const { width, height } = calculateNodeDimensions(schemaNode);
    
    // Create layout node
    layoutNodes.push({
      id: schemaNode.id,
      width,
      height,
      domain,
    });
    
    // Assign the domain to the schema node for future reference
    schemaNode.domain = domain;
  });
  
  // Create edges for the layout
  schemaNodes.forEach(schemaNode => {
    // Handle 'extends' relationships
    if (schemaNode.extends) {
      schemaNode.extends.forEach(extendedType => {
        const targetNode = schemaNodes.find(node => node.name === extendedType);
        if (targetNode) {
          layoutEdges.push({
            id: `${schemaNode.id}-extends-${targetNode.id}`,
            source: schemaNode.id,
            target: targetNode.id,
            type: 'extends',
          });
        }
      });
    }
    
    // Handle 'implements' relationships
    if (schemaNode.implements) {
      schemaNode.implements.forEach(implementedInterface => {
        const targetNode = schemaNodes.find(node => node.name === implementedInterface);
        if (targetNode) {
          layoutEdges.push({
            id: `${schemaNode.id}-implements-${targetNode.id}`,
            source: schemaNode.id,
            target: targetNode.id,
            type: 'implements',
          });
        }
      });
    }
    
    // Handle 'references' relationships
    if (schemaNode.references) {
      schemaNode.references.forEach(reference => {
        const targetNode = schemaNodes.find(node => node.name === reference);
        if (targetNode) {
          layoutEdges.push({
            id: `${schemaNode.id}-references-${targetNode.id}`,
            source: schemaNode.id,
            target: targetNode.id,
            type: 'references',
          });
        }
      });
    }
  });
  
  // Apply layout algorithm
  const positionedNodes = createHierarchicalLayout(layoutNodes, layoutEdges);
  
  // Transform to graph format
  const graphNodes: GraphNode[] = [];
  const nodeMap = new Map<string, GraphNode>();
  
  positionedNodes.forEach(layoutNode => {
    const schemaNode = schemaNodes.find(node => node.id === layoutNode.id);
    if (schemaNode) {
      const graphNode: GraphNode = {
        id: schemaNode.id,
        type: 'schema',
        position: { x: layoutNode.x || 0, y: layoutNode.y || 0 },
        data: { ...schemaNode },
      };
      graphNodes.push(graphNode);
      nodeMap.set(graphNode.id, graphNode);
    }
  });
  
  const graphEdges: GraphEdge[] = [];
  layoutEdges.forEach(layoutEdge => {
    const graphEdge: GraphEdge = {
      id: layoutEdge.id,
      source: layoutEdge.source,
      target: layoutEdge.target,
      type: 'smoothstep',
      animated: false,
      data: {
        type: layoutEdge.type,
      },
    };
    graphEdges.push(graphEdge);
  });
  
  // Set cross-domain flags for edges
  graphEdges.forEach(edge => {
    const isCrossDomain = isEdgeCrossingDomains(edge, nodeMap);
    if (isCrossDomain) {
      if (!edge.data) edge.data = {};
      edge.data.isCrossDomain = true;
    }
  });
  
  return { nodes: graphNodes, edges: graphEdges };
}

// Helper function to get a map of domain to colors for consistent styling
export function getDomainColors(): Record<SchemaDomain, string> {
  return {
    'Architecture': '#1976d2',
    'State Management': '#2e7d32',
    'Data Handling': '#9c27b0',
    'Auth': '#d32f2f',
    'Uncategorized': '#757575',
  };
}

// Export for use in the store
export function getDomains(): SchemaDomain[] {
  return ['Architecture', 'State Management', 'Data Handling', 'Auth', 'Uncategorized'];
}

// --- Placeholder for Layout Calculation (using Dagre) ---
/*
function applyLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphData {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB' }); // Top-to-bottom layout

    nodes.forEach((node) => {
        // TODO: Get actual node dimensions for better layout
        dagreGraph.setNode(node.id, { label: node.data.name, width: 150, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
        };
    });

    return { nodes: layoutNodes, edges };
}
*/ 