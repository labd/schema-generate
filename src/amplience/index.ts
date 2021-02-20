/* eslint-disable import/no-named-as-default-member */
import { paramCase } from 'change-case'
import { hasTag, isValue } from '../lib/util'
import ts from 'typescript'
import { AmplienceContentTypeJsonFiles } from './types'
import { contentType, contentTypeSettings } from './common'
import { contentTypeSchema } from './content-type'
import { partialSchema } from './partial'

export const generateAmplienceSchemas = (
  fileNames: string[],
  { schemaHost } = { schemaHost: 'https://schema-examples.com' }
) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  const exportedInterfaces = fileNames
    .map(program.getSourceFile)
    .filter(isValue)
    .flatMap(checker.getSymbolAtLocation)
    .filter(isValue)
    .flatMap(checker.getExportsOfModule)
    .filter((s) => ts.isInterfaceDeclaration(s.declarations[0]))
    .map((s) => checker.getTypeAtLocation(s.declarations[0]))

  return [
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'content'))
      .map<AmplienceContentTypeJsonFiles>((t) => ({
        name: paramCase(t.symbol.name),
        contentType: contentType(t, schemaHost, 'CONTENT_TYPE'),
        contentTypeSchema: contentTypeSchema(t, checker, schemaHost),
        contentTypeSettings: contentTypeSettings(t, schemaHost),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'slot'))
      .map<AmplienceContentTypeJsonFiles>((t) => ({
        name: paramCase(t.symbol.name),
        contentType: contentType(t, schemaHost, 'SLOT'),
        contentTypeSchema: contentTypeSchema(t, checker, schemaHost),
        contentTypeSettings: contentTypeSettings(t, schemaHost),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'partial'))
      .map<AmplienceContentTypeJsonFiles>((t) => ({
        name: paramCase(t.symbol.name),
        contentType: contentType(t, schemaHost, 'PARTIAL'),
        contentTypeSchema: partialSchema(t, checker, schemaHost),
      })),
  ]
}

/**
 * @amplience_type
 */
export interface ContentReference {
  contentType: string
  id: string
}

/**
 * @amplience_type
 */
export interface ContentLink {
  contentType: string
  id: string
}

/**
 * @amplience_type
 */
export interface ImageLink {
  id: string
  name: string
  endpoint: string
  defaultHost: string
}
/**
 * @amplience_type
 */
export interface VideoLink {
  id: string
  name: string
  endpoint: string
  defaultHost: string
}
