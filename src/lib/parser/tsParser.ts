// TypeScript Compiler API parsing logic
import * as ts from 'typescript';
// Use path alias for type import
import { SchemaNode } from '@/lib/types/schema';
import { 
  extractInterfaceDetails, 
  extractTypeAliasDetails,
  extractEnumDetails,
  extractClassDetails 
} from './schemaExtractor';

/**
 * Parses a TypeScript file content and extracts schema information
 * @param content The TypeScript file content as string
 * @param fileName Optional source file name for reference
 * @returns Array of extracted schema nodes
 */
export function parseTypeScriptFile(content: string, fileName: string = 'virtual.ts'): SchemaNode[] {
  console.log(`Parsing content from ${fileName}...`);
  
  try {
    // Create a source file from the content
    const sourceFile = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true // setParentNodes
    );

    // For advanced type checking, we would need to create a Program
    // This would require more complex setup with CompilerHost and file system
    // For now, we'll focus on AST-based extraction which handles most cases

    // Begin AST traversal
    const extractedNodes: SchemaNode[] = [];
    ts.forEachChild(sourceFile, (node) => {
      visitNode(node, extractedNodes, sourceFile);
    });

    console.log(`Finished parsing. Found ${extractedNodes.length} schema nodes.`);
    
    // If no nodes were found, create a placeholder node for debugging
    if (extractedNodes.length === 0 && process.env.NODE_ENV === 'development') {
      return [
        { 
          id: 'placeholder1', 
          name: 'PlaceholderInterface', 
          type: 'interface', 
          properties: [{name: 'prop1', type: 'string', optional: false}],
          sourceFile: fileName
        }
      ];
    }
    
    return extractedNodes;
  } catch (error) {
    console.error('Error parsing TypeScript file:', error);
    throw new Error(`Failed to parse TypeScript file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Node visitor function that identifies different TypeScript declarations
 * and extracts their details
 */
function visitNode(node: ts.Node, collection: SchemaNode[], sourceFile: ts.SourceFile): void {
  try {
    // Check for interfaces
    if (ts.isInterfaceDeclaration(node)) {
      const extracted = extractInterfaceDetails(node, sourceFile);
      if (extracted) collection.push(extracted);
    }
    // Check for type aliases
    else if (ts.isTypeAliasDeclaration(node)) {
      const extracted = extractTypeAliasDetails(node, sourceFile);
      if (extracted) collection.push(extracted);
    }
    // Check for enums
    else if (ts.isEnumDeclaration(node)) {
      const extracted = extractEnumDetails(node, sourceFile);
      if (extracted) collection.push(extracted);
    }
    // Check for classes
    else if (ts.isClassDeclaration(node)) {
      const extracted = extractClassDetails(node, sourceFile);
      if (extracted) collection.push(extracted);
    }
    
    // Continue traversal to nested nodes
    ts.forEachChild(node, (child) => visitNode(child, collection, sourceFile));
  } catch (error) {
    console.warn('Error visiting node:', error);
    // Continue traversal even if one node fails
    ts.forEachChild(node, (child) => visitNode(child, collection, sourceFile));
  }
} 