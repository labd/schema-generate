/* eslint-disable import/no-named-as-default-member */
import { AmplienceContentTypeSchema } from './types'
import { typeUri, refType, AMPLIENCE_TYPE, objectProperties, description } from './common'
import { capitalCase } from 'change-case'
import { hasSymbolFlag } from '../lib/util'
import ts from 'typescript'

/**
 * Returns a Amplience ContentType from an interface type.
 */
export const contentTypeSchema = (
  type: ts.Type,
  checker: ts.TypeChecker,
  schemaHost: string
): AmplienceContentTypeSchema => ({
  $id: typeUri(type, schemaHost),
  $schema: 'http://json-schema.org/draft-07/schema#',
  ...refType(AMPLIENCE_TYPE.content),
  title: capitalCase(type.symbol.name),
  description: description(type.symbol, checker) ?? capitalCase(type.symbol.name),
  type: 'object',
  properties: {
    _meta: { $ref: 'http://bigcontent.io/cms/schema/v1/core#/definitions/meta' },
    ...objectProperties(type, checker, schemaHost),
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
