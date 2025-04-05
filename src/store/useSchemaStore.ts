import { create } from 'zustand';
import { GraphNode, GraphEdge, SchemaNode } from '@/lib/types/schema';
import { StateCreator } from 'zustand';
import { parseTypeScriptFile } from '@/lib/parser/tsParser';
import { transformSchemaToGraph } from '@/lib/transformer/graphTransformer';

export interface SchemaStore {
  // Schema data
  schema: SchemaNode[] | null;
  graphData: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
  selectedNodeId: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  uploadSchema: (file: File) => Promise<void>;
  parseSchema: (content: string, fileName: string) => void;
  transformToGraph: () => void;
  selectNode: (nodeId: string | null) => void;
  updateLayout: () => void; // Placeholder for potential layout adjustments
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearState: () => void; // Action to reset the store
}

const storeCreator: StateCreator<SchemaStore> = (set, get) => ({
  // Initial state
  schema: null,
  graphData: null,
  selectedNodeId: null,
  isLoading: false,
  error: null,

  // Actions Implementation
  uploadSchema: async (file: File) => {
    set({ isLoading: true, error: null });
    console.log('Upload action triggered for file:', file.name);
    
    try {
      // Read the file content
      const content = await readFileContent(file);
      
      // Parse the content
      get().parseSchema(content, file.name);
    } catch (error) {
      console.error('Error processing file:', error);
      set({ 
        error: `Failed to process file: ${error instanceof Error ? error.message : String(error)}`, 
        isLoading: false 
      });
    }
  },

  parseSchema: (content: string, fileName: string) => {
    set({ isLoading: true, error: null });
    console.log('Parsing schema content from', fileName);
    
    try {
      // Use the TypeScript parser to extract schema nodes
      const parsedSchema = parseTypeScriptFile(content, fileName);
      
      // Update the state with the parsed schema
      set({ schema: parsedSchema });
      
      // After successful parsing, transform to graph data
      get().transformToGraph();
    } catch (error) {
      console.error('Error parsing schema:', error);
      set({ 
        error: `Failed to parse schema: ${error instanceof Error ? error.message : String(error)}`, 
        isLoading: false 
      });
    }
  },

  transformToGraph: () => {
    try {
      const { schema } = get();
      
      if (!schema || schema.length === 0) {
        set({ error: 'No schema data to transform', isLoading: false });
        return;
      }
      
      console.log('Transforming schema to graph data...');
      
      // Use the graph transformer to create nodes and edges
      const graph = transformSchemaToGraph(schema);
      
      set({
        graphData: graph,
        isLoading: false
      });
    } catch (error) {
      console.error('Error transforming schema to graph:', error);
      set({ 
        error: `Failed to transform data: ${error instanceof Error ? error.message : String(error)}`, 
        isLoading: false 
      });
    }
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
    console.log('Node selected:', nodeId);
  },

  updateLayout: () => {
    console.log('Update layout action triggered...');
    const { graphData } = get();
    
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return;
    }
    
    // Use shallow copying to minimize impact on rerenders
    // We don't need to recreate the entire nodes array, just ensure React detects a change
    // This is much more efficient than creating a completely new object
    set(state => {
      // Only update if we have data
      if (!state.graphData) return state;
      
      // Create a new reference for the graph data object without deep copying the nodes
      return { 
        graphData: {
          // Use the same node/edge objects but in a new array container
          nodes: state.graphData.nodes,
          edges: state.graphData.edges
        }
      };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error: error, isLoading: false }),

  clearState: () => set({ 
    schema: null, 
    graphData: null, 
    selectedNodeId: null, 
    isLoading: false, 
    error: null 
  }),
});

/**
 * Helper function to read a file and return its content as a string
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

const useSchemaStore = create<SchemaStore>(storeCreator);

export default useSchemaStore; 