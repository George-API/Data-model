'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  Panel,
  useKeyPress,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useSchemaStore from '@/store/useSchemaStore';
import SchemaNode from './SchemaNode';
import SchemaEdge from './SchemaEdge';
import SectionLabel from './SectionLabel';
import { GraphNode, GraphEdge, SchemaDomain } from '@/lib/types/schema';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import { getDomainColors, getDomains } from '@/lib/transformer/graphTransformer';

// Define node types for ReactFlow
const nodeTypes = {
  schema: SchemaNode,
};

// Define edge types for ReactFlow
const edgeTypes = {
  smoothstep: SchemaEdge,
};

// Domain colors for visual categorization
const domainColors: Record<SchemaDomain, string> = getDomainColors();

// Add markers for different edge types
const edgeMarkers = (
  <svg style={{ position: 'absolute', top: 0, left: 0 }}>
    <defs>
      <marker
        id="edge-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
      </marker>
      <marker
        id="edge-arrow-extends"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1976d2" />
      </marker>
      <marker
        id="edge-arrow-implements"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2e7d32" stroke="none" />
      </marker>
      <marker
        id="edge-arrow-references"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9c27b0" stroke="none" />
      </marker>
    </defs>
  </svg>
);

// Inner component that actually renders the flow with domain filtering
interface FlowWithDomainsProps {
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  onNodeClick: (nodeId: string) => void;
}

function FlowWithDomains({ graphData, onNodeClick }: FlowWithDomainsProps) {
  const reactFlowInstance = useReactFlow();
  const allDomains = getDomains();
  
  // State for visible domains
  const [visibleDomains, setVisibleDomains] = useState<SchemaDomain[]>(allDomains);
  const [showControls, setShowControls] = useState(true);
  // Reference to track if we need to trigger a layout update
  const layoutUpdateRef = useRef<boolean>(false);
  // Track if initial layout has been applied
  const initialLayoutRef = useRef<boolean>(false);
  
  // Toggle filter panel with 'F' key
  const fPressed = useKeyPress('f');
  useEffect(() => {
    if (fPressed) {
      setShowControls(prev => !prev);
    }
  }, [fPressed]);
  
  // Memoize node types to prevent recreation on each render
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  
  // Memoize edge types to prevent recreation on each render
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);
  
  // Filter nodes and edges based on selected domains
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => 
      visibleDomains.includes(node.data.domain || 'Uncategorized')
    );
  }, [graphData.nodes, visibleDomains]);
  
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    return graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }, [graphData.edges, filteredNodes]);
  
  // Group nodes by domain for section labels
  const nodesByDomain = useMemo(() => {
    const grouped = new Map<SchemaDomain, GraphNode[]>();
    
    allDomains.forEach(domain => {
      grouped.set(domain, []);
    });
    
    filteredNodes.forEach(node => {
      const domain = node.data.domain || 'Uncategorized';
      if (grouped.has(domain)) {
        grouped.get(domain)!.push(node);
      }
    });
    
    return grouped;
  }, [filteredNodes, allDomains]);
  
  // Calculate section positions
  const sectionPositions = useMemo(() => {
    const positions = new Map<SchemaDomain, { x: number, y: number }>();
    
    nodesByDomain.forEach((nodes, domain) => {
      if (nodes.length === 0) return;
      
      // Find top-left corner for positioning section labels
      let minX = Infinity;
      let minY = Infinity;
      
      nodes.forEach(node => {
        minX = Math.min(minX, node.position.x - 100);
        minY = Math.min(minY, node.position.y - 100);
      });
      
      // Use top-left corner for positioning
      positions.set(domain, { 
        x: minX,
        y: minY 
      });
    });
    
    return positions;
  }, [nodesByDomain]);
  
  // Domain filter toggle handler
  const handleDomainToggle = (domain: SchemaDomain) => {
    setVisibleDomains(prev => {
      // Toggle the domain
      const isVisible = prev.includes(domain);
      const newVisible = isVisible
        ? prev.filter(d => d !== domain)
        : [...prev, domain];
      
      // Don't allow empty selection
      if (newVisible.length === 0) return prev;
      
      // Flag that we need a layout update due to filter change
      layoutUpdateRef.current = true;
      
      return newVisible;
    });
  };
  
  // Trigger initial layout once when component mounts
  useEffect(() => {
    if (filteredNodes.length > 0 && !initialLayoutRef.current) {
      initialLayoutRef.current = true;
      
      // Use a short delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        console.log(`Initial layout for ${filteredNodes.length} nodes`);
        reactFlowInstance.fitView({ 
          padding: 0.2, 
          includeHiddenNodes: false,
          duration: 800 // Slower animation for initial layout
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [filteredNodes.length, reactFlowInstance]);
  
  // Handle layout updates only when needed (separate from filtering)
  useEffect(() => {
    if (layoutUpdateRef.current && filteredNodes.length > 0) {
      // Reset the flag
      layoutUpdateRef.current = false;
      
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        console.log(`Layout update triggered for ${filteredNodes.length} nodes and ${filteredEdges.length} edges`);
        reactFlowInstance.fitView({ 
          padding: 0.2, 
          includeHiddenNodes: false,
          duration: 500 
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [filteredNodes.length, filteredEdges.length, reactFlowInstance, visibleDomains]);
  
  // Reset view function
  const resetView = () => {
    if (filteredNodes.length > 0) {
      console.log('Reset view triggered');
      // Ensure store is updated before fitting view
      useSchemaStore.getState().updateLayout();
      // Wait for the next render
      setTimeout(() => {
        reactFlowInstance.fitView({ 
          padding: 0.2, 
          includeHiddenNodes: false,
          duration: 300
        });
      }, 50);
    }
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Domain filter toggle button */}
      <Panel position="top-left">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={showControls ? "Hide filters" : "Show filters"}>
            <IconButton 
              onClick={() => setShowControls(prev => !prev)}
              sx={{ 
                backgroundColor: 'white', 
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }
              }}
              size="small"
            >
              {showControls 
                ? <FilterAltOffIcon fontSize="small" color="primary" /> 
                : <FilterAltIcon fontSize="small" color="primary" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset view">
            <IconButton 
              onClick={resetView}
              sx={{ 
                backgroundColor: 'white', 
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }
              }}
              size="small"
            >
              <CenterFocusWeakIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Panel>
      
      {/* Domain filter panel */}
      {showControls && (
        <Panel position="top-right">
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              backgroundColor: 'white', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              maxWidth: 300,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Filter by Domain
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {allDomains.map(domain => {
                const isVisible = visibleDomains.includes(domain);
                const nodeCount = nodesByDomain.get(domain)?.length || 0;
                
                // Skip domains with no nodes
                if (nodeCount === 0) return null;
                
                return (
                  <Chip 
                    key={domain} 
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography variant="body2">{domain}</Typography>
                        <Chip 
                          label={nodeCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            minWidth: 20,
                            fontSize: '0.65rem',
                            ml: 1,
                            backgroundColor: isVisible ? 'white' : 'rgba(0,0,0,0.08)',
                            color: isVisible ? domainColors[domain] : 'rgba(0,0,0,0.6)',
                          }} 
                        />
                      </Box>
                    }
                    onClick={() => handleDomainToggle(domain)}
                    sx={{ 
                      justifyContent: 'space-between',
                      backgroundColor: isVisible ? `${domainColors[domain]}15` : 'transparent',
                      color: isVisible ? domainColors[domain] : 'text.secondary',
                      border: `1px solid ${isVisible ? domainColors[domain] : 'rgba(0, 0, 0, 0.12)'}`,
                      '&:hover': {
                        backgroundColor: isVisible ? `${domainColors[domain]}20` : 'rgba(0,0,0,0.04)',
                      }
                    }} 
                  />
                );
              })}
            </Box>
          </Paper>
        </Panel>
      )}
      
      {/* Edge markers */}
      {edgeMarkers}
      
      {/* Section labels */}
      {Array.from(sectionPositions.entries()).map(([domain, position]) => (
        <SectionLabel
          key={domain}
          domain={domain}
          position={position}
          nodeCount={nodesByDomain.get(domain)?.length || 0}
        />
      ))}
      
      {/* ReactFlow with filtered nodes and edges */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 0 
      }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={memoizedNodeTypes}
          edgeTypes={memoizedEdgeTypes}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: 'url(#edge-arrow)',
          }}
          onNodeClick={(_event, node) => onNodeClick(node.id)}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          minZoom={0.2}
          maxZoom={1.5}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={true}
          panOnDrag={true}
          connectionLineType={ConnectionLineType.SmoothStep}
          style={{ width: '100%', height: '100%' }}
        >
          <Controls 
            position="bottom-right"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '4px',
              padding: '4px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)',
            }}
            showInteractive={false}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={15} 
            size={1} 
            color="rgba(0,0,0,0.04)"
            style={{
              backgroundColor: '#fafafa',
            }}
          />
        </ReactFlow>
      </div>
    </Box>
  );
}

// Main SchemaGraph component
const SchemaGraph: React.FC = () => {
  const graphData = useSchemaStore(state => state.graphData);
  const selectNode = useSchemaStore(state => state.selectNode);
  
  // Memoize the handler to prevent unnecessary re-renders
  const handleNodeClick = useCallback((nodeId: string) => {
    selectNode(nodeId);
  }, [selectNode]);
  
  // Memoize FlowWithDomains props to prevent unnecessary re-renders
  const flowProps = useMemo(() => ({
    graphData: graphData || { nodes: [], edges: [] },
    onNodeClick: handleNodeClick
  }), [graphData, handleNodeClick]);
  
  // If no graph data, show empty state
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ width: 80, opacity: 0.25 }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="30" height="30" rx="4" fill="#1976d2" opacity="0.7" />
            <rect x="60" y="10" width="30" height="30" rx="4" fill="#2e7d32" opacity="0.7" />
            <rect x="10" y="60" width="30" height="30" rx="4" fill="#9c27b0" opacity="0.7" />
            <rect x="60" y="60" width="30" height="30" rx="4" fill="#ff9800" opacity="0.7" />
            <line x1="45" y1="25" x2="55" y2="25" stroke="#555" strokeWidth="2" />
            <line x1="25" y1="45" x2="25" y2="55" stroke="#555" strokeWidth="2" />
            <line x1="75" y1="45" x2="75" y2="55" stroke="#555" strokeWidth="2" />
            <line x1="45" y1="75" x2="55" y2="75" stroke="#555" strokeWidth="2" />
          </svg>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          No Schema Loaded
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
          Upload a TypeScript file with types, interfaces, or classes to visualize your schema
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        display: 'flex', // Ensure the container takes up space
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ReactFlowProvider>
          <FlowWithDomains {...flowProps} />
        </ReactFlowProvider>
      </div>
    </Box>
  );
};

export default SchemaGraph; 