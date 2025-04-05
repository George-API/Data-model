'use client'; // Required for event handlers like onChange

import React, { useCallback, useState } from 'react';
import useSchemaStore from '@/store/useSchemaStore';
import { SchemaStore } from '@/store/useSchemaStore';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DoneIcon from '@mui/icons-material/Done';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const FileUpload: React.FC = () => {
  // Explicitly type the state in selectors
  const uploadSchema = useSchemaStore((state: SchemaStore) => state.uploadSchema);
  const isLoading = useSchemaStore((state: SchemaStore) => state.isLoading);
  const hasGraphData = useSchemaStore((state: SchemaStore) => !!state.graphData);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      setSelectedFileName(file.name);
      uploadSchema(file);
    }
  }, [uploadSchema]);

  return (
    <Paper 
      elevation={0}
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
      <Box 
        sx={{ 
          padding: 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CloudUploadIcon color="primary" sx={{ fontSize: 18 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          TypeScript Schema
        </Typography>
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          flexGrow: 1,
          gap: 2,
        }}
      >
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
              Processing {selectedFileName}...
            </Typography>
            <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        ) : hasGraphData ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.light',
                color: 'white',
                mb: 1,
              }}
            >
              <DoneIcon />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Schema Loaded
            </Typography>
            {selectedFileName && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                <InsertDriveFileOutlinedIcon 
                  sx={{ 
                    fontSize: '1rem',
                    verticalAlign: 'text-bottom',
                    mr: 0.5,
                  }}
                />
                {selectedFileName}
              </Typography>
            )}
            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{ 
                mt: 1,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Upload Another File
              <input
                type="file"
                hidden
                accept=".ts,.tsx,.d.ts"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                opacity: 0.8,
                mb: 2,
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
              Upload your TypeScript schema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Upload a TypeScript file with interfaces, types, and classes to visualize your schema
            </Typography>
            <Button
              variant="contained"
              component="label"
              size="large"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".ts,.tsx,.d.ts"
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Accepts .ts, .tsx, .d.ts files
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default FileUpload; 