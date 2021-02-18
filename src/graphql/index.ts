/* eslint-disable import/no-named-as-default-member */
import ts from 'typescript'

export type ID = string & { __ID?: undefined }
export type Int = number & { __ID?: undefined }
export type Float = number & { __Float?: undefined }

export const generateGraphqlTypes = (fileNames: string[]) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  return (
    fileNames
      .map((f) => program.getSourceFile(f)!)
      .flatMap((sourceFile) => [
        ...sourceFile
          .getChildAt(0)
          .getChildren()
          .filter(ts.isTypeAliasDeclaration)
          .map((node) => serializeType(node, checker)),
        ...sourceFile
          .getChildAt(0)
          .getChildren()
          .filter(ts.isInterfaceDeclaration)
          .map((node) => serializeInterface(node, checker)),
      ])
      .join('\n') + '\n'
  )
}

const serializeType = (node: ts.TypeAliasDeclaration, _checker: ts.TypeChecker) =>
  node.getText().includes('|') ? node.getText().replace(/export type/, 'union') : ''

/** Converts a TS interface into a GraphQL type.
 *
 * For example, given an interface
 * ```ts
 * interface A {
 *  prop: string
 * }
 * ```
 *
 * This will generate
 * ```graqhql
 * type A {
 *   prop: String!
 * }
 * ```
 */
const serializeInterface = (node: ts.InterfaceDeclaration, checker: ts.TypeChecker) => `type ${
  node.name.text
} {
${node.members.map((p) => serializeMember(p, checker)).join('\n')}
}`

/**
 * Converts a TS interface property to a GraphQL property
 */
const serializeMember = (node: ts.TypeElement, checker: ts.TypeChecker) =>
  `  ${node.name?.getText()}: ${
    getTagType(node.name as ts.Identifier, checker) ??
    swapBrackets(checker.typeToString(checker.getTypeAtLocation(node.name as ts.Identifier)))
  }${node.questionToken ? '' : '!'}`

/**
 * Looks in JSDoc for '@type' and returns that type name.
 */
const getTagType = (identifier: ts.Identifier, checker: ts.TypeChecker) =>
  checker
    .getSymbolAtLocation(identifier)
    ?.getJsDocTags()
    .find((t) => t.name === 'type')?.text

// Converts `xxx[]` to `[xxx!]`
const swapBrackets = (input: string) => {
  const pattern = /(\w+)\[\]/
  if (pattern.test(input)) {
    return `[${mapType(input.substring(0, input.length - 2))}!]`
  }
  return mapType(input)
}

const mapType = (input: string) =>
  input === 'string' ? 'String' : input === 'number' ? 'Float' : input
