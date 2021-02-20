/* eslint-disable import/no-named-as-default-member */
import {
  getExportedTypes,
  hasSymbolFlag,
  hasTag,
  hasTypeFlag,
  isValue,
  switchArray,
} from '../lib/util'
import ts from 'typescript'

export const generateGraphqlTypes = (fileNames: string[]) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  const exportedTypes = getExportedTypes(fileNames, program)

  const exportedInterfaces = exportedTypes
    .map((type) => (type.isClassOrInterface() ? type : undefined))
    .filter(isValue)

  const exportedUnionTypes = exportedTypes
    .map((type) => (type.isUnion() ? type : undefined))
    .filter(isValue)

  return (
    [
      ...exportedUnionTypes.map((type) => toUnionString(type, checker)),
      ...exportedInterfaces.map((type) => toTypeString(type, checker)),
    ].join('\n') + '\n'
  )
}

const toUnionString = (type: ts.UnionType, _checker: ts.TypeChecker) =>
  `union ${type.aliasSymbol!.name} = ${type.types.map((t) => t.symbol.name).join(' | ')}`

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
const toTypeString = (type: ts.InterfaceType, checker: ts.TypeChecker) => `type ${
  type.symbol.name
} {
${type
  .getProperties()
  .map(
    (prop) =>
      `  ${prop.name}: ${toPropertyType(
        prop,
        checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration),
        checker
      )}`
  )
  .join('\n')}
}`

/**
 * Converts a TS interface property to a GraphQL property
 */
const toPropertyType = (prop: ts.Symbol, type: ts.Type, checker: ts.TypeChecker): string =>
  switchArray(type, checker, {
    ifArray: (subType) => `[${getName(prop, subType)}!]`,
    other: (type) => getName(prop, type),
  }) + maybeRequired(prop)

const getName = (prop: ts.Symbol, type: ts.Type) =>
  hasTypeFlag(type, ts.TypeFlags.String)
    ? prop.name === 'id'
      ? 'ID'
      : 'String'
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? hasTag(prop, 'float')
      ? 'Float'
      : 'Int'
    : hasTypeFlag(type, ts.TypeFlags.Boolean)
    ? 'Boolean'
    : hasTypeFlag(type, ts.TypeFlags.Object)
    ? type.symbol.name
    : hasTypeFlag(type, ts.TypeFlags.Union)
    ? type.aliasSymbol!.name
    : ''

const maybeRequired = (prop: ts.Symbol) => (hasSymbolFlag(prop, ts.SymbolFlags.Optional) ? '' : '!')
