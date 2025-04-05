// Helper functions to extract details from TypeScript AST nodes
import * as ts from 'typescript';
import { SchemaNode, Property, Method, Parameter } from '@/lib/types/schema';

/**
 * Extracts details for an Interface Declaration.
 */
export function extractInterfaceDetails(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): SchemaNode | null {
  if (!node.name) return null;
  const name = node.name.getText(sourceFile);
  const id = `interface_${name}_${node.pos}`; // Add pos for potential uniqueness
  console.log(`Extractor: Found interface ${name}`);

  // Extract properties and methods
  const properties = extractProperties(node.members, sourceFile);
  const methods = extractMethods(node.members, sourceFile);
  
  // Extract extends relationships
  const extendsNodes = extractHeritageClauses(node.heritageClauses, ts.SyntaxKind.ExtendsKeyword, sourceFile);

  return {
    id: id,
    name: name,
    type: 'interface',
    sourceFile: sourceFile.fileName,
    properties: properties,
    methods: methods,
    extends: extendsNodes,
  };
}

/**
 * Extracts details for a Type Alias Declaration.
 */
export function extractTypeAliasDetails(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): SchemaNode | null {
  if (!node.name) return null;
  const name = node.name.getText(sourceFile);
  const id = `type_${name}_${node.pos}`;
  console.log(`Extractor: Found type alias ${name}`);

  // For object type literals, extract properties
  let properties: Property[] = [];
  
  if (node.type && ts.isTypeLiteralNode(node.type)) {
    properties = extractProperties(node.type.members, sourceFile);
  }
  
  // Extract type references - will help create node relationships
  const references = extractTypeReferences(node.type, sourceFile);

  return {
    id: id,
    name: name,
    type: 'type',
    sourceFile: sourceFile.fileName,
    properties: properties,
    references: references,
  };
}

/**
 * Extracts details for an Enum Declaration.
 */
export function extractEnumDetails(node: ts.EnumDeclaration, sourceFile: ts.SourceFile): SchemaNode | null {
  if (!node.name) return null;
  const name = node.name.getText(sourceFile);
  const id = `enum_${name}_${node.pos}`;
  console.log(`Extractor: Found enum ${name}`);

  // Extract enum members as "properties" with initialized values
  const properties: Property[] = [];
  
  node.members.forEach(member => {
    const memberName = member.name.getText(sourceFile);
    let memberValue = 'unknown';
    
    // Try to extract the enum value if present
    if (member.initializer) {
      memberValue = member.initializer.getText(sourceFile);
    }
    
    properties.push({
      name: memberName,
      type: memberValue,
      optional: false
    });
  });

  return {
    id: id,
    name: name,
    type: 'enum',
    sourceFile: sourceFile.fileName,
    properties: properties,
  };
}

/**
 * Extracts details for a Class Declaration.
 */
export function extractClassDetails(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): SchemaNode | null {
  if (!node.name) return null;
  const name = node.name.getText(sourceFile);
  const id = `class_${name}_${node.pos}`;
  console.log(`Extractor: Found class ${name}`);

  // Extract properties (class members)
  const properties: Property[] = [];
  
  // Extract methods
  const methods: Method[] = [];
  
  // Process members
  node.members.forEach(member => {
    if (ts.isPropertyDeclaration(member)) {
      const propName = member.name.getText(sourceFile);
      let propType = 'any';
      
      if (member.type) {
        propType = member.type.getText(sourceFile);
      }
      
      const optional = !!member.questionToken;
      
      properties.push({
        name: propName,
        type: propType,
        optional
      });
    } 
    else if (ts.isMethodDeclaration(member)) {
      methods.push(extractMethod(member, sourceFile));
    }
  });
  
  // Extract heritage (extends and implements)
  const extendsNodes = extractHeritageClauses(node.heritageClauses, ts.SyntaxKind.ExtendsKeyword, sourceFile);
  const implementsNodes = extractHeritageClauses(node.heritageClauses, ts.SyntaxKind.ImplementsKeyword, sourceFile);

  return {
    id: id,
    name: name,
    type: 'class',
    sourceFile: sourceFile.fileName,
    properties: properties,
    methods: methods,
    extends: extendsNodes,
    implements: implementsNodes,
  };
}

/**
 * Extracts properties from node members.
 */
function extractProperties(members: ts.NodeArray<ts.TypeElement> | undefined, sourceFile: ts.SourceFile): Property[] {
    if (!members) return [];
    
    const properties: Property[] = [];
    members.forEach(member => {
        if (ts.isPropertySignature(member) && member.name) {
            const propName = member.name.getText(sourceFile);
            let propType = 'any';
            
            if (member.type) {
                propType = member.type.getText(sourceFile);
            }
            
            const optional = !!member.questionToken;
            properties.push({ name: propName, type: propType, optional });
            console.log(`Extractor: Found property ${propName}: ${propType}`);
        }
    });
    return properties;
}

/**
 * Extracts methods from node members.
 */
function extractMethods(members: ts.NodeArray<ts.TypeElement> | undefined, sourceFile: ts.SourceFile): Method[] {
    if (!members) return [];
    
    const methods: Method[] = [];
    members.forEach(member => {
        if (ts.isMethodSignature(member) && member.name) {
            methods.push(extractMethod(member, sourceFile));
        }
    });
    return methods;
}

/**
 * Extracts a method from a method signature or method declaration.
 */
function extractMethod(methodNode: ts.MethodSignature | ts.MethodDeclaration, sourceFile: ts.SourceFile): Method {
    const methodName = methodNode.name.getText(sourceFile);
    let returnType = 'any';
    
    if (methodNode.type) {
        returnType = methodNode.type.getText(sourceFile);
    }
    
    const parameters = extractParameters(methodNode.parameters, sourceFile);
    console.log(`Extractor: Found method ${methodName}`);
    
    return {
        name: methodName,
        returnType,
        parameters
    };
}

/**
 * Extracts parameters from a parameter list.
 */
function extractParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>, sourceFile: ts.SourceFile): Parameter[] {
    const result: Parameter[] = [];
    
    parameters.forEach(param => {
        const paramName = param.name.getText(sourceFile);
        let paramType = 'any';
        
        if (param.type) {
            paramType = param.type.getText(sourceFile);
        }
        
        result.push({
            name: paramName,
            type: paramType
        });
    });
    
    return result;
}

/**
 * Extracts heritage clauses (extends/implements) from a declaration.
 */
function extractHeritageClauses(
    clauses: ts.NodeArray<ts.HeritageClause> | undefined, 
    kind: ts.SyntaxKind, 
    sourceFile: ts.SourceFile
): string[] {
    if (!clauses) return [];
    
    const result: string[] = [];
    
    clauses.forEach(clause => {
        if (clause.token === kind) {
            clause.types.forEach(type => {
                // For simplicity, we'll just extract the type name as text
                // A more advanced version would resolve the actual type references
                const typeName = type.expression.getText(sourceFile);
                result.push(typeName);
            });
        }
    });
    
    return result;
}

/**
 * Extract type references from a type node.
 * This is useful for establishing relationships between types.
 */
export function extractTypeReferences(typeNode: ts.TypeNode | undefined, sourceFile: ts.SourceFile): string[] {
    if (!typeNode) return [];
    
    const references: string[] = [];
    
    // Handle direct type references
    if (ts.isTypeReferenceNode(typeNode)) {
        references.push(typeNode.typeName.getText(sourceFile));
    }
    
    // For union and intersection types, process each constituent type
    if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
        typeNode.types.forEach(type => {
            references.push(...extractTypeReferences(type, sourceFile));
        });
    }
    
    return references;
} 