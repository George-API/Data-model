'use client';

import React, { useState } from 'react';
import useSchemaStore from '@/store/useSchemaStore';
import { SchemaStore } from '@/store/useSchemaStore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

// Icons
import GridOnIcon from '@mui/icons-material/GridOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearIcon from '@mui/icons-material/Clear';
import InterfaceIcon from '@mui/icons-material/Layers';
import TypeIcon from '@mui/icons-material/Code';
import EnumIcon from '@mui/icons-material/List';
import ClassIcon from '@mui/icons-material/ViewModule';
import SettingsIcon from '@mui/icons-material/Settings';

// Type style configuration
const typeColors = {
  interface: '#1976d2', // Blue
  type: '#2e7d32', // Green
  enum: '#9c27b0', // Purple
  class: '#ff9800', // Orange
};

const ControlPanel: React.FC = () => {
  const updateLayout = useSchemaStore((state: SchemaStore) => state.updateLayout);
  const clearState = useSchemaStore((state: SchemaStore) => state.clearState);
  const hasGraphData = useSchemaStore((state: SchemaStore) => !!state.graphData);
  const [nodeTypes, setNodeTypes] = useState<string[]>(['interface', 'type', 'enum', 'class']);
  const [layoutType, setLayoutType] = useState<string>('tree');

  // Handle layout type change
  const handleLayoutChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLayout: string | null,
  ) => {
    if (newLayout !== null) {
      setLayoutType(newLayout);
      updateLayout(); // Call store's updateLayout function
      // TODO: Update the layout algorithm based on selected type
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 2,
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
          <SettingsIcon color="action" sx={{ fontSize: 18, opacity: 0.7 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Controls
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Reset View Button */}
          <Tooltip title="Reset View" arrow>
            <IconButton 
              size="small" 
              disabled={!hasGraphData}
              onClick={updateLayout}
              sx={{ 
                color: 'action.active',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Clear Graph Button */}
          <Tooltip title="Clear Graph" arrow>
            <IconButton 
              size="small" 
              color="error" 
              disabled={!hasGraphData}
              onClick={clearState}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ padding: 2, flexGrow: 1, overflow: 'auto' }}>
        {/* Node Type Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              color: 'text.secondary',
              mb: 1.5,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              fontSize: '0.7rem',
            }}
          >
            Node Types
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['interface', 'type', 'enum', 'class'].map((nodeType) => {
              const color = typeColors[nodeType as keyof typeof typeColors];
              const isSelected = nodeTypes.includes(nodeType);
              
              return (
                <Chip
                  key={nodeType}
                  icon={
                    nodeType === 'interface' ? <InterfaceIcon fontSize="small" /> :
                    nodeType === 'type' ? <TypeIcon fontSize="small" /> :
                    nodeType === 'enum' ? <EnumIcon fontSize="small" /> :
                    <ClassIcon fontSize="small" />
                  }
                  label={nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                  onClick={() => {
                    const newTypes = isSelected 
                      ? nodeTypes.filter(t => t !== nodeType)
                      : [...nodeTypes, nodeType];
                    if (newTypes.length > 0) {
                      setNodeTypes(newTypes);
                    }
                  }}
                  sx={{
                    backgroundColor: isSelected ? `${color}15` : 'transparent',
                    color: isSelected ? color : 'text.secondary',
                    border: `1px solid ${isSelected ? color : 'rgba(0, 0, 0, 0.12)'}`,
                    fontWeight: 500,
                    '& .MuiChip-icon': {
                      color: isSelected ? color : 'text.secondary',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Layout Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              color: 'text.secondary',
              mb: 1.5,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              fontSize: '0.7rem',
            }}
          >
            Layout
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              borderRadius: 2,
              p: 1,
            }}
          >
            <ToggleButtonGroup
              value={layoutType}
              exclusive
              onChange={handleLayoutChange}
              aria-label="layout type"
              size="small"
              fullWidth
            >
              <ToggleButton 
                value="grid" 
                aria-label="grid layout"
                sx={{ 
                  border: 'none !important',
                  borderRadius: '6px !important',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <GridOnIcon fontSize="small" />
                  <Typography variant="body2">Grid</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton 
                value="tree" 
                aria-label="tree layout"
                sx={{ 
                  border: 'none !important',
                  borderRadius: '6px !important',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AccountTreeIcon fontSize="small" />
                  <Typography variant="body2">Tree</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button 
          variant="contained" 
          size="medium"
          disabled={!hasGraphData}
          fullWidth
          onClick={updateLayout}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
            boxShadow: 'none',
            height: 40,
          }}
        >
          Apply Layout
        </Button>
      </Box>
    </Box>
  );
};

export default ControlPanel; 