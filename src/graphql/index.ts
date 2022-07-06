/* eslint-disable import/no-named-as-default-member */
import {
  getExportedTypes,
  hasSymbolFlag,
  hasTag,
  hasTypeFlag,
  isValue,
  switchArray,
  findTags,
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

  const extendedInterfaces = exportedInterfaces
    .flatMap((i) => i.getBaseTypes())
    .filter(isValue)
    .map((n) => (n.isClassOrInterface() ? n : undefined))
    .filter(isValue)

  const exportedIntersectionTypes = exportedTypes.filter(isScalarType)

  return (
    [
      `directive @markdown on FIELD_DEFINITION`,
      `scalar AmplienceLocalizedString`,
      ...exportedIntersectionTypes.map(toScalar),
      ...exportedUnionTypes.map(toUnionString),
      ...extendedInterfaces.map((type) => toTypeString(type, checker, true)),
      ...exportedInterfaces
        .filter((type) => !hasTag(type.symbol, 'ignore'))
        .map((type) => toTypeString(type, checker)),
    ].join('\n') + '\n'
  )
}

const toUnionString = (type: ts.UnionType) =>
  type.types.every((t) => t.isStringLiteral())
    ? `enum ${type.aliasSymbol!.name} {\n${type.types
        .map((t) => '  ' + (t as ts.StringLiteralType).value)
        .join('\n')}\n}`
    : `union ${type.aliasSymbol!.name} = ${type.types.map((t) => t.symbol.name).join(' | ')}`

const isScalarType = (type: ts.Type): type is ts.IntersectionType =>
  type.isIntersection() && type.getProperties().some((p) => p.name === `__scalar`)
const toScalar = (type: ts.IntersectionType) => `scalar ${type.aliasSymbol!.name}`

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
const toTypeString = (type: ts.InterfaceType, checker: ts.TypeChecker, isInterface = false) => `${
  isInterface ? 'interface' : 'type'
} ${type.symbol.name}${getImplements(type)}${getDirectives(type.symbol)} {
${type
  .getProperties()
  .filter((prop) => !hasTag(prop, 'ignore'))
  .map(
    (prop) =>
      `  ${prop.name}: ${toPropertyType(
        prop,
        checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration),
        checker
      )}${getDirectives(prop)}`
  )
  .join('\n')}
}`

const getImplements = (type: ts.InterfaceType) =>
  type.getBaseTypes()?.length
    ? ` implements ${type
        .getBaseTypes()
        ?.map((t) => t.symbol.name)
        .join(', ')}`
    : ''

const extractScalarsFromType = (type: ts.InterfaceType, checker: ts.TypeChecker) =>
  type.getProperties().flatMap(() =>
    switchArray(type, checker, {
      ifArray: (subType) => extractScalarsFromProp(subType, checker),
      other: (type) => extractScalarsFromProp(type, checker),
    })
  )

const extractScalarsFromProp = (type: ts.Type, checker: ts.TypeChecker): ts.Type[] =>
  isScalarType(type)
    ? [type]
    : type.isClassOrInterface()
    ? extractScalarsFromType(type, checker)
    : []

/**
 * Converts a TS interface property to a GraphQL property
 */
const toPropertyType = (prop: ts.Symbol, type: ts.Type, checker: ts.TypeChecker): string =>
  switchArray(type, checker, {
    ifArray: (subType) => `[${getName(prop, subType)}]`,
    other: (type) => getName(prop, type),
  }) + maybeRequired(prop, type)

const getName = (prop: ts.Symbol, type: ts.Type) =>
  isScalarType(type)
    ? type.aliasSymbol?.name
    : hasTypeFlag(type, ts.TypeFlags.String)
    ? prop.name === 'id'
      ? 'ID'
      : hasTag(prop, 'localized')
      ? 'AmplienceLocalizedString'
      : 'String'
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? hasTag(prop, 'float')
      ? 'Float'
      : 'Int'
    : hasTypeFlag(type, ts.TypeFlags.Boolean)
    ? 'Boolean'
    : hasTypeFlag(type, ts.TypeFlags.Object) && type.symbol
    ? type.symbol.name
    : hasTypeFlag(type, ts.TypeFlags.Union)
    ? type.aliasSymbol!.name
    : ''

const maybeRequired = (prop: ts.Symbol, type: ts.Type) =>
  hasSymbolFlag(prop, ts.SymbolFlags.Optional) ||
  (hasTag(prop, 'localized') && hasTypeFlag(type, ts.TypeFlags.String))
    ? ''
    : '!'

const getDirectives = (prop: ts.Symbol) =>
  findTags(prop, ['directive', 'format'])
    .filter((t) => t.name !== 'format' || t.text === 'markdown')
    .map((t) => ` @${t.text}`)
    .join('')
