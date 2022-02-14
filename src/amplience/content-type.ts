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
  filterableTrait,
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
  'trait:sortable': sortableTrait(type),
  'trait:filterable': filterableTrait(type),
  type: 'object',
  properties: {
    ...objectProperties(type, checker, schemaHost),
  },
  propertyOrder: type
    .getProperties()
    .filter((prop) => ['ignoreAmplience'].every((term) => !hasTag(prop, term)))
    .map((n) => n.name),
  required: type
    .getProperties()
    .filter((prop) => ['ignoreAmplience'].every((term) => !hasTag(prop, term)))
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
    .filter((prop) => ['children', 'ignoreAmplience'].every((term) => !hasTag(prop, term)))
    .map((n) => n.name),
  required: type
    .getProperties()
    .filter((prop) => ['children', 'ignoreAmplience'].every((term) => !hasTag(prop, term)))
    .filter((m) => !hasSymbolFlag(m, ts.SymbolFlags.Optional))
    .map((n) => n.name),
})
