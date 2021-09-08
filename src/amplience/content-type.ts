/* eslint-disable import/no-named-as-default-member */
import { AmplienceContentTypeSchema, GeneratorConfig } from './types'
import {
  typeUri,
  refType,
  AMPLIENCE_TYPE,
  objectProperties,
  description,
  sortableTrait,
  hierarchyTrait,
} from './common'
import { capitalCase } from 'change-case'
import { hasSymbolFlag, hasTag } from '../lib/util'
import ts from 'typescript'

/**
 * Returns a Amplience ContentType from an interface type.
 */
export const contentTypeSchemaBody = (
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
  properties: {
    ...objectProperties(type, checker, schemaHost),
  },
  propertyOrder: type.getProperties().map((n) => n.name),
  required: type
    .getProperties()
    .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
    .map((n) => n.name),
})

export const hierarchyContentTypeSchemaBody = (
  type: ts.Type,
  checker: ts.TypeChecker,
  { schemaHost }: GeneratorConfig
): AmplienceContentTypeSchema => ({
  $id: typeUri(type, schemaHost),
  $schema: 'http://json-schema.org/draft-07/schema#',
  ...refType(AMPLIENCE_TYPE.CORE.Content, {
    $ref: AMPLIENCE_TYPE.CORE.HierarchyNode,
  }),
  title: capitalCase(type.symbol.name),
  description: description(type.symbol, checker) ?? capitalCase(type.symbol.name),
  'trait:hierarchy': hierarchyTrait(type, schemaHost),
  'trait:sortable': sortableTrait(type),
  type: 'object',
  properties: {
    ...objectProperties(type, checker, schemaHost),
  },
  propertyOrder: type
    .getProperties()
    .filter((n) => !hasTag(n, 'children'))
    .map((n) => n.name),
  required: type
    .getProperties()
    .filter((m) => !hasTag(m, 'children'))
    .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
    .map((n) => n.name),
})
