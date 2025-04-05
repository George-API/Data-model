'use client'; // Needed for client-side components and hooks

import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import our custom components using updated path aliases
import FileUpload from '@/components/FileUpload';
import SchemaGraph from '@/components/SchemaGraph';
import ControlPanel from '@/components/ControlPanel';
import NodeDetails from '@/components/NodeDetails';

// Modern theme with light styling
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline />
      <Box 
        sx={{ 
          height: '100vh',
          backgroundColor: theme.palette.background.default,
          p: { xs: 1, sm: 2, md: 3 },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          height: '100%',
          gap: 2
        }}>
          {/* Left sidebar - File upload and controls */}
          <Box sx={{ 
            flexBasis: { xs: '100%', md: '25%', lg: '20%' },
            height: { xs: 'auto', md: '100%' },
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2 
          }}>
            {/* Upload Area */}
            <Box sx={{ height: { xs: '300px', md: '40%' }, minHeight: 280 }}>
              <FileUpload />
            </Box>
            
            {/* Control Panel */}
            <Box sx={{ flexGrow: 1 }}>
              <ControlPanel />
            </Box>
          </Box>
          
          {/* Middle - Graph visualization */}
          <Box sx={{ 
            flexGrow: 1,
            flexBasis: { xs: '100%', md: '50%', lg: '60%' },
            height: { xs: '500px', md: '100%' },
            display: 'flex'
          }}>
            <SchemaGraph />
          </Box>
          
          {/* Right sidebar - Node details */}
          <Box sx={{ 
            flexBasis: { xs: '100%', md: '25%', lg: '20%' },
            height: { xs: 'auto', md: '100%' },
            display: 'flex'
          }}>
            <NodeDetails />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
