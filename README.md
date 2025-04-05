# Schema Model: TypeScript Schema Visualization Tool

## Overview
This tool visually maps your codebase's core architecture—including data handling and state management—by parsing a generated TypeScript schema file. It provides an interactive, node-based diagram that helps developers understand complex codebases at a glance.

**Note:** We are currently working in the initial Next.js TypeScript project that has already been created.

## Tech Stack
- **Framework**: React/Next.js with TypeScript
- **Parser**: TypeScript Compiler API
- **Visualization**: React Flow (primary), Reagraph (for complex graphs)
- **State Management**: Zustand
- **UI Components**: Material-UI (MUI)

## Implementation Details

### Expected File Structure
```
src/
├── components/
│   ├── FileUpload.tsx       # Component for uploading schema files
│   ├── SchemaGraph.tsx      # Main visualization component
│   ├── ControlPanel.tsx     # UI controls for diagram manipulation
│   └── NodeDetails.tsx      # Component showing selected node details
├── lib/
│   ├── parser/
│   │   ├── tsParser.ts      # TypeScript parsing logic
│   │   └── schemaExtractor.ts # Extract types and relationships
│   ├── transformer/
│   │   └── graphTransformer.ts # Convert TS data to graph format
│   └── types/
│       └── schema.ts        # TypeScript interfaces for the app
├── store/
│   └── useSchemaStore.ts    # Zustand store implementation
└── pages/
    ├── index.tsx            # Main app page
    └── api/                 # Any necessary API routes
```

### Data Models
The core data models should include:

```typescript
// Example of expected parsing result
interface SchemaNode {
  id: string;
  name: string;
  type: 'interface' | 'type' | 'enum' | 'class';
  properties?: Property[];
  methods?: Method[];
  extends?: string[];
  implements?: string[];
}

interface Property {
  name: string;
  type: string;
  optional: boolean;
}

interface Method {
  name: string;
  returnType: string;
  parameters: Parameter[];
}

interface Parameter {
  name: string;
  type: string;
}

// Graph data structure
interface GraphNode {
  id: string;
  type: string;
  data: SchemaNode;
  position: { x: number, y: number };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'extends' | 'implements' | 'references';
  label?: string;
}
```

### TypeScript Compiler API Usage
When using the TypeScript API, focus on:
1. Creating a `ts.Program` instance to parse the schema file
2. Using `checker.getTypeAtLocation()` and related methods to extract type information
3. Traversing AST using `ts.forEachChild()` to find interfaces, types, etc.
4. Building relationship maps by tracking type references 

### React Flow Integration
Key aspects for the visualization:
1. Use `ReactFlow` as the main component with custom nodes
2. Implement `nodeTypes` for different schema entities
3. Use `Controls` and `MiniMap` components for better UX
4. Implement a layout algorithm (dagre recommended) for initial positioning

### Zustand Store Structure
```typescript
interface SchemaStore {
  // Schema data
  schema: SchemaNode[] | null;
  graphData: { nodes: GraphNode[], edges: GraphEdge[] } | null;
  selectedNode: string | null;
  
  // Actions
  uploadSchema: (file: File) => Promise<void>;
  parseSchema: (content: string) => void;
  transformToGraph: () => void;
  selectNode: (nodeId: string | null) => void;
  updateLayout: () => void;
}
```

## Application Flow

```mermaid
flowchart LR
  A[User] --> B[UI (Next.js + MUI)]
  B --> C[Select/Upload TS Schema File]
  C --> D[TypeScript Parser]
  D --> E[Data Transformation]
  E --> F[Visualization Setup]
  F --> G[React Flow / Reagraph Diagram]
  G --> H[User Interaction]
  H --> I[Zustand State Management]
```

```mermaid
flowchart TD
  A[TypeScript Schema File] --> B[TypeScript Parser]
  B --> C[Extracted Schema Data]
  C --> D[Data Transformation (Nodes & Edges)]
  D --> E[Zustand State Store]
  E --> F[Diagram Rendering (React Flow / Reagraph)]
  F --> G[Interactive Visualization]
```

## Development Steps

### 1. Project Setup
1. ✅ Set up a Next.js project with TypeScript
2. Install required packages:
   - `typescript` (for parsing)
   - `reactflow` (for interactive diagrams)
   - `reagraph` (for advanced graph visualizations)
   - `zustand` (for state management)
   - `@mui/material` (plus necessary MUI dependencies)

### 2. TypeScript Schema Parsing
1. Use the TypeScript compiler API to read and parse the schema file
2. Extract key elements such as types, interfaces, and their relationships

### 3. Data Transformation
1. Convert the parsed data into a structured format (nodes and edges) suitable for graph visualization
2. Focus on mapping out core architecture, data flows, and state interactions

### 4. Visualization Implementation
1. Integrate React Flow to render an interactive, zoomable, and pannable diagram
2. Optionally, integrate Reagraph for handling large or complex graphs
3. Implement interactive features like tooltips and click events for detailed insights

### Documentation Resources
- **React Flow**: [Official Documentation](https://reactflow.dev/docs/introduction/)
  - [Node Types](https://reactflow.dev/docs/api/nodes/node-types/)
  - [Edge Types](https://reactflow.dev/docs/api/edges/edge-types/)
  - [Layout](https://reactflow.dev/docs/examples/layout/dagre/)

- **Reagraph**: [Official Documentation](https://reagraph.dev/docs)
  - [API Reference](https://reagraph.dev/docs/api-reference/)
  - [Styling](https://reagraph.dev/docs/styling/)
  - [Events](https://reagraph.dev/docs/events/)

- **TypeScript Compiler API**: [Official Documentation](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
  - [Handbook](https://github.com/microsoft/TypeScript-wiki/blob/main/Using-the-Compiler-API.md)

- **Zustand**: [GitHub Repository](https://github.com/pmndrs/zustand)
  - [Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

### UI Design Guidelines

#### Developer-Focused Layout
Design the UI with developer workflows in mind:

1. **Workspace Layout**
   - Use a 3-panel layout: 
     - Left panel: Schema explorer/file browser
     - Center: Main visualization area
     - Right panel: Selected node details and properties

2. **Interactive Elements**
   - Search functionality with type-ahead for finding specific types/interfaces
   - Filter controls for isolating specific components of the schema
   - Zoom controls prominently displayed
   - Pan/navigate buttons for keyboard navigation

3. **Information Hierarchy**
   - Color-code nodes by type (interfaces, types, enums, etc.)
   - Use consistent visual language for relationship types
   - Implement collapsible nodes for complex types
   - Add badges for number of properties, methods

4. **Visual Cues**
   - Highlight related nodes on hover/selection
   - Show inheritance chains with clear visual distinction
   - Use dotted lines for optional relationships, solid for required
   - Include subtle grid background for spatial reference

5. **Performance Considerations**
   - Implement virtualization for large schemas (only render visible nodes)
   - Add ability to collapse/expand sections of the graph
   - Include "focus mode" to display only directly related nodes

#### Theme & Styling
- Use a light/dark theme toggle (default to system preference)
- Implement high contrast mode for accessibility
- Choose a color palette that distinguishes different types clearly:
  - Interfaces: Blue
  - Types: Green
  - Enums: Purple
  - Classes: Orange
  - Relationships: Gray gradients

#### Component-Specific Guidelines

**Node Component**
- Rounded rectangle shape
- Header with type icon and name
- Collapsible property list
- Context menu for actions (focus, hide, expand)

**Edge Component**
- Curved paths with directional arrows
- Hover state shows relationship type
- Click to highlight the full path

**Control Panel**
- Sticky position at top of visualization
- Clearly labeled filter options
- Save/export visualization options
- Layout algorithm selector

**Node Details Panel**
- Complete type information
- Syntax-highlighted properties
- Copy button for type definition
- Links to related types
- Source file location (if available)

### 5. State Management Integration
1. Set up Zustand to manage the application's state
2. Ensure smooth updates and user interaction handling
3. Synchronize state changes with the diagram's rendering for real-time updates

### 6. UI Development with MUI
1. Build a clean and modern UI using Material-UI components
2. Design a layout that emphasizes the visual map
3. Create panels and modals for additional details

### 7. Testing & Optimization
1. Test the parsing, data transformation, and visualization components
2. Optimize performance for large datasets and ensure responsiveness
3. Iterate on the design based on usability feedback

## Implementation Prompt for AI Assistant

Use this prompt when working with an AI assistant to implement this project:

```
Please implement the Schema Model visualization tool as described in the README. This is an internal developer tool for visualizing TypeScript schema structures using Next.js, React Flow, and Zustand.

Follow these guidelines:

1. Use modern React patterns (functional components, hooks) and TypeScript best practices (strong typing, interfaces).

2. Implement the project in clear stages:
   - First, set up the file structure and install dependencies
   - Then implement the TypeScript parser using the TypeScript Compiler API
   - Create the data transformation layer
   - Build the visualization components with React Flow
   - Implement state management with Zustand
   - Finally, design the UI with Material-UI

3. Write clean, maintainable code with:
   - Clear separation of concerns
   - Appropriate error handling
   - Descriptive variable and function names
   - Comments for complex logic
   - Unit tests for critical components

4. When implementing the visualization:
   - Focus on performance for large schemas
   - Ensure the UI is intuitive and dev-friendly
   - Follow the design guidelines in the README

5. Prioritize the core functionality first: successfully parsing and visualizing TypeScript schemas before adding advanced features.

Please stay focused on implementing one component at a time, and explain your implementation decisions. If you encounter challenges with the TypeScript Compiler API or React Flow, refer to the documentation links provided in the README.
```

Important: To keep the AI assistant on task, regularly review the implementation against the requirements in this README. The core goal is a functional TypeScript schema visualization tool, so if the AI begins to drift from this focus, redirect it back to the fundamental requirements before adding extensions or enhancements.
