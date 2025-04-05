// Core data models based on README

// Domain categories for logical grouping
export type SchemaDomain = 'Architecture' | 'State Management' | 'Data Handling' | 'Auth' | 'Uncategorized';

// Expected parsing result structure
export interface SchemaNode {
  id: string;
  name: string;
  type: 'interface' | 'type' | 'enum' | 'class';
  properties?: Property[];
  methods?: Method[];
  extends?: string[]; // IDs of nodes this extends
  implements?: string[]; // IDs of nodes this implements
  references?: string[]; // IDs of nodes this references
  sourceFile?: string; // Optional: path to source file
  domain?: SchemaDomain; // Categorization of the node
}

export interface Property {
  name: string;
  type: string; // This could be a simple type string or an ID reference to another SchemaNode
  optional: boolean;
}

export interface Method {
  name: string;
  returnType: string; // Could be simple type or ID reference
  parameters: Parameter[];
}

export interface Parameter {
  name: string;
  type: string; // Could be simple type or ID reference
}

// Graph data structure for React Flow
export interface GraphNode {
  id: string;
  type: string; // Custom node type for React Flow (e.g., 'schemaNode')
  data: SchemaNode; // Embed the extracted schema node data
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  type?: string; // Custom edge type for React Flow (e.g., 'relationshipEdge')
  label?: string; // e.g., 'extends', 'implements', 'references'
  animated?: boolean;
  data?: {
    isCrossDomain?: boolean;
    [key: string]: unknown; // More specific than 'any'
  };
} 