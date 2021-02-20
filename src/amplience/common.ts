/* eslint-disable import/no-named-as-default-member */
import { AmplienceContentType, AmplienceContentTypeSettings, AmpliencePropertyType } from './types'
import { capitalCase, paramCase } from 'change-case'
import { maybeToNumber, findTag, hasTypeFlag, hasTag } from '../lib/util'
import ts from 'typescript'

export const contentType = (
  type: ts.Type,
  schemaHost: string,
  validationLevel: 'CONTENT_TYPE' | 'PARTIAL' | 'SLOT'
): AmplienceContentType => ({
  body: `./schemas/${paramCase(type.symbol.name)}-schema.json`,
  schemaId: typeUri(type, schemaHost),
  validationLevel,
})

export const contentTypeSettings = (
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
        ...ampliencePropertyType(
          prop,
          checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration),
          checker,
          schemaHost
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
  type.symbol?.name === 'Array'
    ? {
        type: 'array',
        minItems: maybeToNumber(findTag(prop, 'minItems')?.text),
        maxItems: maybeToNumber(findTag(prop, 'maxItems')?.text),
        items: ampliencePropertyType(
          prop,
          checker.getTypeArguments(type as ts.TypeReference)[0],
          checker,
          schemaHost
        ),
      }
    : hasTypeFlag(type, ts.TypeFlags.Object)
    ? hasTag(type.symbol, 'amplience_type')
      ? {
          type: 'object',
          ...refType(
            amplienceDefinition(type),
            hasTag(prop, 'enum')
              ? {
                  properties: {
                    contentType: { enum: enumLinks(findTag(prop, 'enum')?.text ?? '', schemaHost) },
                  },
                }
              : {}
          ),
        }
      : hasTag(type.symbol, 'partial')
      ? refType(definitionUri(type, schemaHost))
      : { type: 'object', properties: objectProperties(type, checker, schemaHost) }
    : hasTypeFlag(type, ts.TypeFlags.String)
    ? checkLocalized(prop, {
        type: 'string',
        format: findTag(prop, 'format')?.text,
        minLength: maybeToNumber(findTag(prop, 'minLength')?.text),
        maxLength: maybeToNumber(findTag(prop, 'maxLength')?.text),
      })
    : hasTypeFlag(type, ts.TypeFlags.Number)
    ? { type: 'number' }
    : hasTypeFlag(type, ts.TypeFlags.Boolean)
    ? { type: 'boolean' }
    : {}

const enumLinks = (input: string, schemaHost: string) =>
  input.split('\n').map((l) => typeUriFromString(l.replace(/[\-|*] ?/, ''), schemaHost))

/**
 * Wraps a Amplience type object in localized JSON
 */
export const checkLocalized = (prop: ts.Symbol, result: AmpliencePropertyType) =>
  hasTag(prop, 'localized')
    ? prop.getJsDocTags().length === 1
      ? refType(AMPLIENCE_TYPE.localizedString)
      : localized(result)
    : result

/**
 * Returns a description based on JSDoc.
 */
export const description = (symbol: ts.Symbol, checker: ts.TypeChecker) =>
  symbol.getDocumentationComment(checker).map((x) => x.text)[0]

export const AMPLIENCE_TYPE = {
  localizedString: 'http://bigcontent.io/cms/schema/v1/localization#/definitions/localized-string',
  localizedValue: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
  content: 'http://bigcontent.io/cms/schema/v1/core#/definitions/content',
}

export const refType = (ref: string, ...other: object[]) => ({
  allOf: [{ $ref: ref }, ...other],
})

export const localized = (value: AmpliencePropertyType) => ({
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

export const typeUri = (type: ts.Type, schemaHost: string) =>
  `${schemaHost}/${paramCase(type.symbol.name)}`
export const typeUriFromString = (typeName: string, schemaHost: string) =>
  `${schemaHost}/${paramCase(typeName)}`

export const definitionUri = (type: ts.Type, schemaHost: string) =>
  `${schemaHost}/${paramCase(type.symbol.name)}#/definitions/${paramCase(type.symbol.name)}`

export const amplienceDefinition = (type: ts.Type) =>
  `http://bigcontent.io/cms/schema/v1/core#/definitions/${paramCase(type.symbol.name)}`
