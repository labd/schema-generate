/* eslint-disable import/no-named-as-default-member */
import {
  AmplienceContentType,
  AmplienceContentTypeSettings,
  AmpliencePropertyType,
  GeneratorConfig,
} from './types'
import { capitalCase, paramCase } from 'change-case'
import {
  maybeToNumber,
  findTag,
  hasTypeFlag,
  hasTag,
  switchArray,
  hasSymbolFlag,
} from '../lib/util'
import ts from 'typescript'

export const contentTypeSchema = (
  type: ts.Type,
  validationLevel: 'CONTENT_TYPE' | 'PARTIAL' | 'SLOT',
  { schemaHost }: GeneratorConfig
): AmplienceContentType => ({
  body: `./schemas/${paramCase(type.symbol.name)}-schema.json`,
  schemaId: typeUri(type, schemaHost),
  validationLevel,
})

export const contentType = (
  type: ts.Type,
  icon = 'https://bigcontent.io/cms/icons/ca-types-primitives.png',
  { schemaHost, visualizations }: GeneratorConfig
): AmplienceContentTypeSettings => ({
  contentTypeUri: typeUri(type, schemaHost),
  status: 'ACTIVE',
  settings: {
    label: capitalCase(type.symbol.name),
    icons: [
      {
        size: 256,
        url: icon,
      },
    ],
    visualizations,
    cards: [],
  },
})

/**
 * Returns the properties that go inside Amplience `{type: 'object', properties: ...}`
 */
export const objectProperties = (
  type: ts.Type,
  checker: ts.TypeChecker,
  schemaHost: string
): { [name: string]: AmpliencePropertyType } =>
  Object.fromEntries(
    type.getProperties().map((prop) => [
      prop.name,
      {
        title: capitalCase(prop.name),
        description: description(prop, checker),
        ...switchArray<AmpliencePropertyType>(
          checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration),
          checker,
          {
            ifArray: (subType) => ({
              type: 'array',
              minItems: maybeToNumber(findTag(prop, 'minItems')?.text),
              maxItems: maybeToNumber(findTag(prop, 'maxItems')?.text),
              items: ampliencePropertyType(prop, subType, checker, schemaHost),
            }),
            other: (type) => ampliencePropertyType(prop, type, checker, schemaHost),
          }
        ),
      },
    ])
  )

/**
 * Returns an Amplience type object of various types (number/string/object)
 */
export const ampliencePropertyType = (
  prop: ts.Symbol,
  type: ts.Type,
  checker: ts.TypeChecker,
  schemaHost: string
): AmpliencePropertyType =>
  ['AmplienceImage', 'AmplienceVideo'].includes(type.aliasSymbol?.name ?? type.symbol?.name ?? '')
    ? hasTag(prop, 'localized')
      ? refType(
          AMPLIENCE_TYPE.LOCALIZED[
            (type.aliasSymbol?.name ?? type.symbol?.name) as 'AmplienceImage' | 'AmplienceVideo'
          ]
        )
      : refType(
          AMPLIENCE_TYPE.CORE[
            (type.aliasSymbol?.name ?? type.symbol?.name) as 'AmplienceImage' | 'AmplienceVideo'
          ]
        )
    : hasTag(prop, 'link')
    ? contentLink(type as ts.TypeReference, schemaHost)
    : hasTypeFlag(type, ts.TypeFlags.Object)
    ? ['ContentReference'].includes(type.symbol.name)
      ? contentReference(type as ts.TypeReference, schemaHost)
      : hasTag(type.symbol, 'partial')
      ? refType(definitionUri(type, schemaHost))
      : hasTag(type.symbol, 'content')
      ? inlineContentLink(type as ts.TypeReference, schemaHost)
      : inlineObject(type, checker, schemaHost)
    : hasTypeFlag(type, ts.TypeFlags.String)
    ? checkLocalized(prop, type, {
        type: 'string',
        format: findTag(prop, 'format')?.text,
        minLength: maybeToNumber(findTag(prop, 'minLength')?.text),
        maxLength: maybeToNumber(findTag(prop, 'maxLength')?.text),
        examples: findTag(prop, 'example')?.text?.split('\n'),
      })
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? checkLocalized(prop, type, {
        type: hasTag(prop, 'float') ? 'number' : 'integer',
        minimum: maybeToNumber(findTag(prop, 'minimum')?.text),
        maximum: maybeToNumber(findTag(prop, 'maximum')?.text),
        examples: findTag(prop, 'example')?.text?.split('\n'),
      })
    : hasTypeFlag(type, ts.TypeFlags.Boolean)
    ? checkLocalized(prop, type, { type: 'boolean' })
    : type.isUnion() && type.types.every((t) => t.isStringLiteral())
    ? checkLocalized(prop, type, {
        type: 'string',
        enum: type.types.map((t) => (t as ts.StringLiteralType).value),
        examples: findTag(prop, 'example')?.text?.split('\n'),
      })
    : {}

const contentReference = (type: ts.TypeReference, schemaHost: string) =>
  refType(AMPLIENCE_TYPE.CORE.ContentReference, enumProperties(type.typeArguments![0], schemaHost))

const contentLink = (type: ts.TypeReference, schemaHost: string) =>
  refType(AMPLIENCE_TYPE.CORE.ContentLink, enumProperties(type, schemaHost))

const inlineContentLink = (type: ts.TypeReference, schemaHost: string) => ({
  type: 'object',
  ...refType(typeUri(type, schemaHost)),
})

const inlineObject = (type: ts.Type, checker: ts.TypeChecker, schemaHost: string) => ({
  type: 'object',
  properties: objectProperties(type, checker, schemaHost),
  propertyOrder: type.getProperties().map((n) => n.name),
  required: type
    .getProperties()
    .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
    .map((n) => n.name),
})

const enumProperties = (typeOrUnion: ts.Type, schemaHost: string) => ({
  properties: {
    contentType: {
      enum: (typeOrUnion.isUnion() ? typeOrUnion.types : [typeOrUnion]).map((t) =>
        typeUri(t, schemaHost)
      ),
    },
  },
})

/**
 * Wraps a Amplience type object in localized JSON
 */
export const checkLocalized = (prop: ts.Symbol, type: ts.Type, result: AmpliencePropertyType) =>
  hasTag(prop, 'localized')
    ? prop.getJsDocTags().length === 1 && hasTypeFlag(type, ts.TypeFlags.String)
      ? refType(AMPLIENCE_TYPE.LOCALIZED.String)
      : localized(result)
    : result

/**
 * Returns a description based on JSDoc.
 */
export const description = (symbol: ts.Symbol, checker: ts.TypeChecker) =>
  symbol.getDocumentationComment(checker).map((x) => x.text)[0]

export const AMPLIENCE_TYPE = {
  LOCALIZED: {
    AmplienceImage: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-image',
    AmplienceVideo: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-video',
    String: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-string',
  },
  CORE: {
    LocalizedValue: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
    Content: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content',
    AmplienceImage: 'http://bigcontent.io/cms/schema/v1/core#/definitions/image-link',
    AmplienceVideo: 'http://bigcontent.io/cms/schema/v1/core#/definitions/video-link',
    ContentReference: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content-reference',
    ContentLink: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content-link',
  },
}

export const refType = (ref: string, ...other: object[]) => ({
  allOf: [{ $ref: ref }, ...other],
})

export const localized = (value: AmpliencePropertyType) => ({
  ...refType(AMPLIENCE_TYPE.CORE.LocalizedValue),
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

export const typeUri = (type: ts.Type, schemaHost: string) =>
  `${schemaHost}/${paramCase(type.symbol.name)}`

export const definitionUri = (type: ts.Type, schemaHost: string) =>
  `${schemaHost}/${paramCase(type.symbol.name)}#/definitions/${paramCase(type.symbol.name)}`
