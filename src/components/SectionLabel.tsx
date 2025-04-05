import React from 'react';
import { SchemaDomain } from '@/lib/types/schema';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

// Domain color mappings
const domainColors: Record<SchemaDomain, string> = {
  'Architecture': '#1976d2',
  'State Management': '#2e7d32',
  'Data Handling': '#9c27b0',
  'Auth': '#d32f2f',
  'Uncategorized': '#757575',
};

interface SectionLabelProps {
  domain: SchemaDomain;
  position: { x: number; y: number };
  nodeCount: number;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ domain, position, nodeCount }) => {
  // Don't display empty sections
  if (nodeCount === 0) return null;
  
  const color = domainColors[domain];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: position.y - 50,
        left: position.x - 20,
        zIndex: 0, // Behind nodes but above background
        pointerEvents: 'none', // Allow clicking through to nodes
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          border: `1px solid ${color}20`,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 0 2px ${color}20`,
          }}
        />
        
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: color,
            letterSpacing: '0.01em',
            fontSize: '0.75rem',
          }}
        >
          {domain}
        </Typography>
        
        <Chip
          label={nodeCount}
          size="small"
          sx={{
            height: 16,
            fontSize: '0.65rem',
            backgroundColor: `${color}15`,
            color: color,
            fontWeight: 600,
            minWidth: 20,
          }}
        />
      </Box>
      
      {/* Domain section boundary indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          bottom: -200, // Extend down
          border: `1px dashed ${color}30`,
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </Box>
  );
};

export default SectionLabel; 