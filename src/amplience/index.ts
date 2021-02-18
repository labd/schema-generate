/* eslint-disable import/no-named-as-default-member */
import { capitalCase, paramCase } from 'change-case'
import { findTag, hasSymbolFlag, hasTag, hasTypeFlag, isValue } from '../lib/util'
import ts from 'typescript'

export const generateJson = (
  fileNames: string[],
  { schemaHost } = { schemaHost: 'https://schema-examples.com' }
) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  // serialize all exported interfaces with a `@content` annotation
  return fileNames
    .map(program.getSourceFile)
    .filter(isValue)
    .flatMap(checker.getSymbolAtLocation)
    .filter(isValue)
    .flatMap(checker.getExportsOfModule)
    .filter((s) => ts.isInterfaceDeclaration(s.declarations[0]))
    .map((t) => checker.getTypeAtLocation(t.declarations[0]))
    .filter((t) => hasTag(t.symbol, 'content'))
    .map((t) => contentType(t, checker, schemaHost))
}

/**
 * Returns a Amplience ContentType from an interface type.
 */
const contentType = (type: ts.Type, checker: ts.TypeChecker, schemaHost: string) => ({
  $id: `${schemaHost}/${paramCase(type.symbol.name)}`,
  $schema: 'http://json-schema.org/draft-07/schema#',
  ...refType(AMPLIENCE_TYPE.content),
  title: capitalCase(type.symbol.name),
  description: description(type.symbol, checker),
  type: 'object',
  properties: {
    _meta: { $ref: 'http://bigcontent.io/cms/schema/v1/core#/definitions/meta' },
    ...objectProperties(type, checker),
  },
  propertyOrder: ['_meta', ...type.getProperties().map((n) => n.name)],
  required: [
    '_meta',
    ...type
      .getProperties()
      .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
      .map((n) => n.name),
  ],
})

/**
 * Returns the properties that go inside Amplience `{type: 'object', properties: ...}`
 */
const objectProperties = (
  type: ts.Type,
  checker: ts.TypeChecker
): { [name: string]: AmpliencePropertyType } =>
  Object.fromEntries(
    type.getProperties().map((prop) => [
      prop.name,
      {
        title: capitalCase(prop.name),
        description: description(prop, checker),
        ...ampliencePropertyType(
          prop,
          checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration),
          checker
        ),
      },
    ])
  )

/**
 * Returns an Amplience type object of various types (number/string/object)
 */
const ampliencePropertyType = (
  prop: ts.Symbol,
  type: ts.Type,
  checker: ts.TypeChecker
): AmpliencePropertyType =>
  type.symbol?.name === 'Array'
    ? {
        type: 'array',
        items: ampliencePropertyType(
          prop,
          checker.getTypeArguments(type as ts.TypeReference)[0],
          checker
        ),
      }
    : hasTypeFlag(type, ts.TypeFlags.Object)
    ? { type: 'object', properties: objectProperties(type, checker) }
    : hasTypeFlag(type, ts.TypeFlags.String)
    ? checkLocalized(prop, {
        type: 'string',
        format: findTag(prop, 'format')?.text,
      })
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? { type: 'number' }
    : {}

/**
 * Wraps a Amplience type object in localized JSON
 */
const checkLocalized = (prop: ts.Symbol, result: AmpliencePropertyType) =>
  hasTag(prop, 'localized')
    ? prop.getJsDocTags().length === 1
      ? refType(AMPLIENCE_TYPE.localizedString)
      : localized(result)
    : result

/**
 * Returns a description based on JSDoc.
 */
const description = (symbol: ts.Symbol, checker: ts.TypeChecker) =>
  symbol.getDocumentationComment(checker).map((x) => x.text)[0]

const AMPLIENCE_TYPE = {
  localizedString: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-string',
  localizedValue: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
  content: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content',
}

const refType = (ref: string) => ({
  allOf: [{ $ref: ref }],
})

const localized = (value: AmpliencePropertyType) => ({
  ...refType(AMPLIENCE_TYPE.localizedValue),
  properties: {
    values: {
      items: {
        properties: {
          value,
        },
      },
    },
  },
})

interface AmpliencePropertyType {
  title?: string
  description?: string
  type?: string
  allOf?: { [key: string]: any }[]
  items?: AmpliencePropertyType
  properties?: any
  format?: string
}
