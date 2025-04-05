'use client';

import React from 'react';
import useSchemaStore from '@/store/useSchemaStore';
import { SchemaStore } from '@/store/useSchemaStore';
import { GraphNode, Property, Method } from '@/lib/types/schema';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

// Type configuration for styling
const typeColors = {
  interface: '#1976d2', // Blue
  type: '#2e7d32', // Green
  enum: '#9c27b0', // Purple
  class: '#ff9800', // Orange
};

const NodeDetails: React.FC = () => {
  const selectedNodeId = useSchemaStore((state: SchemaStore) => state.selectedNodeId);
  const nodes = useSchemaStore((state: SchemaStore) => state.graphData?.nodes);
  const selectNode = useSchemaStore((state: SchemaStore) => state.selectNode);

  const selectedNode = React.useMemo(() => {
    if (!selectedNodeId || !nodes) {
      return null;
    }
    return nodes.find((node: GraphNode) => node.id === selectedNodeId);
  }, [selectedNodeId, nodes]);

  if (!selectedNode) {
    return (
      <Box 
        sx={{ 
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          textAlign: 'center',
          color: 'text.secondary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ mb: 2, opacity: 0.7 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9H9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 9H15.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 15.5C9.82588 15.8333 10.911 16.5 12 16.5C13.089 16.5 14.1741 15.8333 14.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          No Node Selected
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, maxWidth: 280 }}>
          Click on a node in the graph to see detailed information about that schema type.
        </Typography>
      </Box>
    );
  }

  const { data: nodeData } = selectedNode;
  const typeColor = typeColors[nodeData.type as keyof typeof typeColors] || typeColors.interface;

  // Handler for clicking on a related node
  const handleRelatedNodeClick = (nodeId: string) => {
    selectNode(nodeId);
  };

  // Find a node by name
  const findNodeByName = (name: string) => {
    if (!nodes) return null;
    return nodes.find(node => node.data.name === name);
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          padding: 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: typeColor,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {nodeData.name}
          </Typography>
        </Box>
        <Chip 
          label={nodeData.type} 
          size="small" 
          sx={{ 
            backgroundColor: `${typeColor}15`,
            color: typeColor,
            fontWeight: 500,
            fontSize: '0.7rem',
            height: 22,
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ padding: 2, flexGrow: 1, overflow: 'auto' }}>
        {/* Source file info */}
        {nodeData.sourceFile && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              color: 'text.secondary',
              mb: 2,
              pb: 1,
              borderBottom: '1px dashed rgba(0,0,0,0.1)', 
            }}
          >
            Source: {nodeData.sourceFile}
          </Typography>
        )}

        {/* Properties Section */}      
        {nodeData.properties && nodeData.properties.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <span>Properties</span>
              <Chip 
                label={nodeData.properties.length} 
                size="small" 
                sx={{ 
                  height: 16, 
                  fontSize: '0.65rem',
                  fontWeight: 'medium',
                  ml: 0.5,
                }}
              />
            </Typography>
            
            <Stack spacing={1}>
              {nodeData.properties.map((prop: Property) => (
                <Card 
                  key={prop.name} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 1.5,
                  }}
                >
                  <CardContent sx={{ padding: '8px 12px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        }}
                      >
                        {prop.name}{prop.optional ? '?' : ''}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                        }}
                      >
                        {prop.type}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Methods Section */}
        {nodeData.methods && nodeData.methods.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <span>Methods</span>
              <Chip 
                label={nodeData.methods.length} 
                size="small" 
                sx={{ 
                  height: 16, 
                  fontSize: '0.65rem',
                  fontWeight: 'medium',
                  ml: 0.5, 
                }}
              />
            </Typography>
            
            <Stack spacing={1}>
              {nodeData.methods.map((method: Method) => (
                <Card 
                  key={method.name} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 1.5,
                  }}
                >
                  <CardContent sx={{ padding: '8px 12px !important' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        mb: 0.5,
                      }}
                    >
                      {method.name}({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowRightAltIcon 
                        sx={{ 
                          fontSize: '1rem', 
                          color: 'text.secondary',
                          mr: 0.5, 
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                        }}
                      >
                        {method.returnType}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Relationships Section */}
        {(nodeData.extends?.length || nodeData.implements?.length || nodeData.references?.length) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Relationships
            </Typography>
            
            {/* Extends */}
            {nodeData.extends && nodeData.extends.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: 'text.secondary',
                    mb: 0.5 
                  }}
                >
                  Extends
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {nodeData.extends.map((ext: string) => {
                    const extNode = findNodeByName(ext);
                    return (
                      <Chip
                        key={ext}
                        label={ext}
                        size="small"
                        onClick={extNode ? () => handleRelatedNodeClick(extNode.id) : undefined}
                        sx={{
                          backgroundColor: extNode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          color: extNode ? '#1976d2' : 'text.secondary',
                          cursor: extNode ? 'pointer' : 'default',
                          height: 24,
                          '.MuiChip-label': {
                            fontWeight: 500,
                          }
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}
            
            {/* Implements */}
            {nodeData.implements && nodeData.implements.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: 'text.secondary',
                    mb: 0.5 
                  }}
                >
                  Implements
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {nodeData.implements.map((impl: string) => {
                    const implNode = findNodeByName(impl);
                    return (
                      <Chip
                        key={impl}
                        label={impl}
                        size="small"
                        onClick={implNode ? () => handleRelatedNodeClick(implNode.id) : undefined}
                        sx={{
                          backgroundColor: implNode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          color: implNode ? '#2e7d32' : 'text.secondary',
                          cursor: implNode ? 'pointer' : 'default',
                          height: 24,
                          '.MuiChip-label': {
                            fontWeight: 500,
                          }
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}
            
            {/* References */}
            {nodeData.references && nodeData.references.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: 'text.secondary',
                    mb: 0.5 
                  }}
                >
                  References
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {nodeData.references.map((ref: string, index: number) => {
                    const refNode = findNodeByName(ref);
                    return (
                      <Chip
                        key={`${ref}-${index}`}
                        label={ref}
                        size="small"
                        onClick={refNode ? () => handleRelatedNodeClick(refNode.id) : undefined}
                        sx={{
                          backgroundColor: refNode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          color: refNode ? '#9c27b0' : 'text.secondary',
                          cursor: refNode ? 'pointer' : 'default',
                          height: 24,
                          '.MuiChip-label': {
                            fontWeight: 500,
                          }
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NodeDetails; 