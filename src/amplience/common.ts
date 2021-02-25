/* eslint-disable import/no-named-as-default-member */
import { AmplienceContentType, AmplienceContentTypeSettings, AmpliencePropertyType } from './types'
import { capitalCase, paramCase } from 'change-case'
import { maybeToNumber, findTag, hasTypeFlag, hasTag, switchArray } from '../lib/util'
import ts from 'typescript'

export const contentTypeSchema = (
  type: ts.Type,
  schemaHost: string,
  validationLevel: 'CONTENT_TYPE' | 'PARTIAL' | 'SLOT'
): AmplienceContentType => ({
  body: `./schemas/${paramCase(type.symbol.name)}-schema.json`,
  schemaId: typeUri(type, schemaHost),
  validationLevel,
})

export const contentType = (
  type: ts.Type,
  schemaHost: string,
  icon = 'https://bigcontent.io/cms/icons/ca-types-primitives.png'
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
    visualizations: [],
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
  hasTypeFlag(type, ts.TypeFlags.Object)
    ? hasTag(type.symbol, 'amplience_type')
      ? hasTag(prop, 'localized') && ['ImageLink', 'VideoLink'].includes(type.symbol.name)
        ? refType(AMPLIENCE_TYPE.LOCALIZED[type.symbol.name as 'ImageLink' | 'VideoLink'])
        : ['ImageLink', 'VideoLink'].includes(type.symbol.name)
        ? {
            type: 'object',
            ...refType(AMPLIENCE_TYPE.CORE[type.symbol.name as 'ImageLink' | 'VideoLink']),
          }
        : {
            type: 'object',
            ...refType(
              AMPLIENCE_TYPE.CORE[type.symbol.name as 'ContentReference'],
              enumProperties(type as ts.TypeReference, schemaHost)
            ),
          }
      : hasTag(type.symbol, 'partial')
      ? refType(definitionUri(type, schemaHost))
      : hasTag(type.symbol, 'content')
      ? refType(typeUri(type, schemaHost))
      : { type: 'object', properties: objectProperties(type, checker, schemaHost) }
    : hasTypeFlag(type, ts.TypeFlags.String)
    ? checkLocalized(prop, {
        type: 'string',
        format: findTag(prop, 'format')?.text,
        minLength: maybeToNumber(findTag(prop, 'minLength')?.text),
        maxLength: maybeToNumber(findTag(prop, 'maxLength')?.text),
      })
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? {
        type: 'number',
        minimum: maybeToNumber(findTag(prop, 'minimum')?.text),
        maximum: maybeToNumber(findTag(prop, 'maximum')?.text),
      }
    : hasTypeFlag(type, ts.TypeFlags.Boolean)
    ? { type: 'boolean' }
    : type.isUnion() && type.types.every((t) => t.isStringLiteral())
    ? { type: 'string', enum: type.types.map((t) => (t as ts.StringLiteralType).value) }
    : {}

const enumProperties = (type: ts.TypeReference, schemaHost: string) => ({
  properties: {
    contentType: {
      enum: type.typeArguments
        // filter out the default `object` arguments
        ?.filter((a) => a.isUnion() || a.symbol)
        .flatMap((a) => (a.isUnion() ? a.types : [a]))
        .map((a) => typeUri(a, schemaHost)),
    },
  },
})

/**
 * Wraps a Amplience type object in localized JSON
 */
export const checkLocalized = (prop: ts.Symbol, result: AmpliencePropertyType) =>
  hasTag(prop, 'localized')
    ? prop.getJsDocTags().length === 1
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
    ImageLink: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-image',
    VideoLink: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-video',
    String: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-string',
  },
  CORE: {
    LocalizedValue: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
    Content: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content',
    ImageLink: 'http://bigcontent.io/cms/schema/v1/core#/definitions/image-link',
    VideoLink: 'http://bigcontent.io/cms/schema/v1/core#/definitions/video-link',
    ContentReference: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content-reference',
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
