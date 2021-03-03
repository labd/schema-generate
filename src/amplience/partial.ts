/* eslint-disable import/no-named-as-default-member */
import { AmplienceContentTypeSchema, GeneratorConfig } from './types'
import { typeUri, refType, AMPLIENCE_TYPE, objectProperties, description } from './common'
import { capitalCase, paramCase } from 'change-case'
import ts from 'typescript'
import { hasSymbolFlag } from '../lib/util'

/**
 * Returns a Amplience ContentType from an interface type.
 */
export const partialSchema = (
  type: ts.Type,
  checker: ts.TypeChecker,
  { schemaHost }: GeneratorConfig
): AmplienceContentTypeSchema => ({
  $id: typeUri(type, schemaHost),
  $schema: 'http://json-schema.org/draft-07/schema#',
  ...refType(AMPLIENCE_TYPE.CORE.Content),
  title: capitalCase(type.symbol.name),
  description: description(type.symbol, checker) ?? capitalCase(type.symbol.name),
  type: 'object',
  definitions: {
    [paramCase(type.symbol.name)]: {
      title: capitalCase(type.symbol.name),
      description: description(type.symbol, checker),
      type: 'object',
      properties: objectProperties(type, checker, schemaHost),
      propertyOrder: type.getProperties().map((n) => n.name),
      required: type
        .getProperties()
        .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
        .map((n) => n.name),
    },
  },
})
