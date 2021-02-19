/* eslint-disable import/no-named-as-default-member */
import { capitalCase, paramCase } from 'change-case'
import { findTag, hasSymbolFlag, hasTag, hasTypeFlag, isValue, maybeToNumber } from '../lib/util'
import ts from 'typescript'
import {
  AmplienceContentTypeJsonFiles,
  AmplienceContentType,
  AmplienceContentTypeSettings,
  AmplienceContentTypeSchema,
  AmpliencePropertyType,
} from 'amplience/amplience_types'

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
    .map((s) => checker.getTypeAtLocation(s.declarations[0]))
    .filter((t) => hasTag(t.symbol, 'content'))
    .map<AmplienceContentTypeJsonFiles>((t) => ({
      name: paramCase(t.symbol.name),
      contentType: contentType(t, schemaHost),
      contentTypeSchema: contentTypeSchema(t, checker, schemaHost),
      contentTypeSettings: contentTypeSettings(t, schemaHost),
    }))
}

const contentType = (type: ts.Type, schemaHost: string): AmplienceContentType => ({
  body: `./schemas/${paramCase(type.symbol.name)}-schema.json`,
  schemaId: typeUri(type, schemaHost),
  validationLevel: 'CONTENT_TYPE',
})

const contentTypeSettings = (type: ts.Type, schemaHost: string): AmplienceContentTypeSettings => ({
  contentTypeUri: typeUri(type, schemaHost),
  status: 'ACTIVE',
  settings: {
    label: capitalCase(type.symbol.name),
    icons: [
      {
        size: 256,
        url: 'https://bigcontent.io/cms/icons/ca-types-primitives.png',
      },
    ],
    visualizations: [],
    cards: [],
  },
})

const typeUri = (type: ts.Type, schemaHost: string) =>
  `${schemaHost}/${paramCase(type.symbol.name)}`

/**
 * Returns a Amplience ContentType from an interface type.
 */
const contentTypeSchema = (
  type: ts.Type,
  checker: ts.TypeChecker,
  schemaHost: string
): AmplienceContentTypeSchema => ({
  $id: typeUri(type, schemaHost),
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
        minLength: maybeToNumber(findTag(prop, 'minLength')?.text),
        maxLength: maybeToNumber(findTag(prop, 'maxLength')?.text),
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
