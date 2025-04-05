import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SchemaNode as SchemaNodeType, SchemaDomain } from '@/lib/types/schema';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';

// Type configuration for modern look
const typeConfig = {
  interface: {
    color: '#1976d2', // Blue
    icon: 'I',
    bgLight: 'rgba(25, 118, 210, 0.08)'
  },
  type: {
    color: '#2e7d32', // Green
    icon: 'T',
    bgLight: 'rgba(46, 125, 50, 0.08)'
  },
  enum: {
    color: '#9c27b0', // Purple
    icon: 'E',
    bgLight: 'rgba(156, 39, 176, 0.08)'
  },
  class: {
    color: '#ff9800', // Orange
    icon: 'C',
    bgLight: 'rgba(255, 152, 0, 0.08)'
  },
};

// Domain color mappings
const domainColors: Record<SchemaDomain, string> = {
  'Architecture': '#1976d2',
  'State Management': '#2e7d32',
  'Data Handling': '#9c27b0',
  'Auth': '#d32f2f',
  'Uncategorized': '#757575',
};

// Custom node component for schema entities
const SchemaNode = ({ data, selected }: NodeProps<SchemaNodeType>) => {
  const [expanded, setExpanded] = useState(false);
  const type = data.type as keyof typeof typeConfig;
  const typeInfo = typeConfig[type] || typeConfig.interface;
  const domain = data.domain || 'Uncategorized';
  const domainColor = domainColors[domain];
  
  // Count items
  const propertyCount = data.properties?.length || 0;
  const methodCount = data.methods?.length || 0;
  const relationshipCount = 
    (data.extends?.length || 0) + 
    (data.implements?.length || 0) + 
    (data.references?.length || 0);
  
  // Toggle expanded state
  const toggleExpanded = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <>
      {/* Connection points */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: domainColor, width: 8, height: 8, border: '2px solid white' }}
      />
      
      <Box
        sx={{
          width: expanded ? 280 : 200,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: selected 
            ? `0 0 0 2px ${typeInfo.color}, 0 4px 10px rgba(0,0,0,0.1)` 
            : '0 2px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          border: 'none',
        }}
      >
        {/* Type indicator badge */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -6,
            left: 10,
            backgroundColor: typeInfo.color,
            color: 'white',
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          {typeInfo.icon}
        </Box>
        
        {/* Domain indicator badge */}
        {domain !== 'Uncategorized' && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: -6,
              right: 10,
              backgroundColor: domainColor,
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'medium',
              padding: '1px 8px',
              borderRadius: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10,
            }}
          >
            {domain}
          </Box>
        )}
        
        {/* Node Header */}
        <Box 
          sx={{ 
            padding: 1.5,
            paddingBottom: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderBottomColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <Typography 
            variant="subtitle1"
            noWrap
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#333',
              fontSize: '0.875rem',
              pl: 2.5, // Space for the type badge
            }}
          >
            {data.name}
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={toggleExpanded}
            sx={{ 
              padding: 0.25,
              color: 'rgba(0,0,0,0.4)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } 
            }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        {/* Node Content */}
        <Box 
          sx={{ 
            padding: 1.5, 
            backgroundColor: typeInfo.bgLight,
            minHeight: 50,
          }}
        >
          {/* Property & Method Summary */}
          <Stack direction="row" spacing={1} sx={{ mb: expanded ? 1 : 0 }}>
            {propertyCount > 0 && (
              <Chip 
                label={`${propertyCount} prop${propertyCount !== 1 ? 's' : ''}`} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.7)',
                }} 
              />
            )}
            
            {methodCount > 0 && (
              <Chip 
                label={`${methodCount} method${methodCount !== 1 ? 's' : ''}`} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.7)',
                }} 
              />
            )}
            
            {relationshipCount > 0 && (
              <Chip 
                label={`${relationshipCount} rel${relationshipCount !== 1 ? 's' : ''}`} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.7)',
                }} 
              />
            )}
          </Stack>
          
          {/* Expanded Details */}
          {expanded && (
            <Box sx={{ mt: 1.5 }}>
              {/* Properties Preview */}
              {data.properties && data.properties.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'rgba(0,0,0,0.6)' }}>
                    Properties
                  </Typography>
                  
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {data.properties.slice(0, 3).map(prop => (
                      <Box 
                        key={prop.name} 
                        sx={{ 
                          fontSize: '0.75rem', 
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          p: 0.75, 
                          borderRadius: 1,
                          display: 'flex',
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: '#333',
                            mr: 0.5,
                          }}
                        >
                          {prop.name}{prop.optional ? '?' : ''}:
                        </Typography>
                        <Typography 
                          variant="caption" 
                          noWrap
                          sx={{ 
                            color: 'rgba(0,0,0,0.6)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                          }}
                        >
                          {prop.type}
                        </Typography>
                      </Box>
                    ))}
                    
                    {data.properties.length > 3 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: typeInfo.color, 
                          fontSize: '0.7rem',
                          textAlign: 'center',
                        }}
                      >
                        +{data.properties.length - 3} more properties
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
              
              {/* Relationships Preview */}
              {(data.extends?.length || data.implements?.length) && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'rgba(0,0,0,0.6)' }}>
                    Relationships
                  </Typography>
                  
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                    {data.extends && data.extends.map(ext => (
                      <Chip 
                        key={ext}
                        label={ext} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          color: '#1976d2',
                          border: '1px solid rgba(25, 118, 210, 0.2)',
                        }} 
                      />
                    ))}
                    
                    {data.implements && data.implements.map(impl => (
                      <Chip 
                        key={impl}
                        label={impl}
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(46, 125, 50, 0.1)',
                          color: '#2e7d32',
                          border: '1px solid rgba(46, 125, 50, 0.2)',
                        }} 
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: domainColor, width: 8, height: 8, border: '2px solid white' }}
      />
    </>
  );
};

export default SchemaNode; 