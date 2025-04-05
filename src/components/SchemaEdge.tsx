import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { GraphEdge } from '@/lib/types/schema';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Modern edge styles for different relationship types
const edgeStyles = {
  extends: {
    stroke: '#1976d2', // Blue
    strokeWidth: 2,
    dashArray: '', // solid line
    label: 'extends',
    labelBg: '#1976d2',
  },
  implements: {
    stroke: '#2e7d32', // Green
    strokeWidth: 1.5,
    dashArray: '5, 2', // dashed line
    label: 'implements',
    labelBg: '#2e7d32',
  },
  references: {
    stroke: '#9c27b0', // Purple
    strokeWidth: 1,
    dashArray: '3, 3', // dotted line
    label: 'references',
    labelBg: '#9c27b0',
  },
  default: {
    stroke: '#616161', // Gray
    strokeWidth: 1,
    dashArray: '',
    label: '',
    labelBg: '#616161',
  },
};

// SchemaEdge component for relationship visualization
const SchemaEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<GraphEdge>) => {
  const relationshipType = data?.type || 'default';
  const edgeStyle = edgeStyles[relationshipType as keyof typeof edgeStyles] || edgeStyles.default;
  
  // Check for cross-domain connection
  const isCrossDomain = data?.data?.isCrossDomain || false;
  
  // Calculate path and label position
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2, // Lower curvature for cleaner lines
  });
  
  // Only show label if it will be visible (not on very short edges)
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const showLabel = distance > 80 && relationshipType !== 'default';
  
  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeDasharray={edgeStyle.dashArray}
        strokeWidth={isCrossDomain ? edgeStyle.strokeWidth + 0.5 : edgeStyle.strokeWidth}
        stroke={edgeStyle.stroke}
        style={{ 
          transition: 'stroke-width 0.2s', 
          opacity: 0.8,
        }}
        markerEnd={markerEnd}
      />
      
      {showLabel && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: 'white',
              color: edgeStyle.labelBg,
              borderRadius: 4,
              fontSize: 10,
              padding: '1px 3px',
              fontWeight: 'medium',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              border: `1px solid ${edgeStyle.labelBg}`,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              ...(isCrossDomain && {
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                fontWeight: 'bold',
              }),
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
              {edgeStyle.label}
            </Typography>
          </Box>
        </EdgeLabelRenderer>
      )}
      
      {/* Show cardinality indicators for cross-domain connections */}
      {isCrossDomain && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: `1.5px solid ${edgeStyle.stroke}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              zIndex: 10,
            }}
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default SchemaEdge; 