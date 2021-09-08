/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { paramCase } from 'change-case'
import { findTag, getExportedTypes, hasTag, isValue } from '../lib/util'
import ts from 'typescript'
import { AmplienceContentTypeJsonFiles, GeneratorConfig } from './types'
import { contentTypeSchema, contentType } from './common'
import { contentTypeSchemaBody, hierarchyContentTypeSchemaBody } from './content-type'
import { partialSchema } from './partial'
import { defaultConfig } from './config'

export const generateAmplienceSchemas = (
  fileNames: string[],
  config: GeneratorConfig = defaultConfig
) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  const exportedTypes = getExportedTypes(fileNames, program)

  const exportedInterfaces = exportedTypes
    .map((type) => (type.isClassOrInterface() ? type : undefined))
    .filter(isValue)

  return [
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'content'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentTypeSchema: contentTypeSchema(type, 'CONTENT_TYPE', config),
        contentTypeSchemaBody: contentTypeSchemaBody(type, checker, config),
        contentType: contentType(type, findTag(type.symbol, 'icon')?.text, config),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'hierarchy'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentTypeSchema: contentTypeSchema(type, 'CONTENT_TYPE', config),
        contentTypeSchemaBody: hierarchyContentTypeSchemaBody(type, checker, config),
        contentType: contentType(type, findTag(type.symbol, 'icon')?.text, config),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'slot'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentTypeSchema: contentTypeSchema(type, 'SLOT', config),
        contentTypeSchemaBody: contentTypeSchemaBody(type, checker, config),
        contentType: contentType(type, findTag(type.symbol, 'icon')?.text, config),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'partial'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentTypeSchema: contentTypeSchema(type, 'PARTIAL', config),
        contentTypeSchemaBody: partialSchema(type, checker, config),
      })),
  ]
}

/**
 * @amplience_type
 */
// @ts-ignore

export interface ContentReference<TypeOrUnion extends object> {
  contentType: string
  id: string
}

/**
 * @amplience_type
 */
export interface AmplienceImage {
  id: string
  name: string
  endpoint: string
  defaultHost: string
}

/**
 * @amplience_type
 */
export interface AmplienceVideo {
  id: string
  name: string
  endpoint: string
  defaultHost: string
}
