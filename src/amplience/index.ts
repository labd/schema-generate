/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { paramCase } from 'change-case'
import { getExportedTypes, hasTag, isValue } from '../lib/util'
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

  const exportedTypes = getExportedTypes(fileNames, program)

  const exportedInterfaces = exportedTypes
    .map((type) => (type.isClassOrInterface() ? type : undefined))
    .filter(isValue)

  return [
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'content'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentType: contentType(type, schemaHost, 'CONTENT_TYPE'),
        contentTypeSchema: contentTypeSchema(type, checker, schemaHost),
        contentTypeSettings: contentTypeSettings(type, schemaHost),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'slot'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentType: contentType(type, schemaHost, 'SLOT'),
        contentTypeSchema: contentTypeSchema(type, checker, schemaHost),
        contentTypeSettings: contentTypeSettings(type, schemaHost),
      })),
    ...exportedInterfaces
      .filter((t) => hasTag(t.symbol, 'partial'))
      .map<AmplienceContentTypeJsonFiles>((type) => ({
        name: paramCase(type.symbol.name),
        contentType: contentType(type, schemaHost, 'PARTIAL'),
        contentTypeSchema: partialSchema(type, checker, schemaHost),
      })),
  ]
}

/**
 * @amplience_type
 */
// @ts-ignore

export interface ContentReference<
  T1 extends object = object,
  T2 extends object = object,
  T3 extends object = object,
  T4 extends object = object,
  T5 extends object = object,
  T6 extends object = object,
  T7 extends object = object,
  T8 extends object = object,
  T9 extends object = object,
  T10 extends object = object,
  T11 extends object = object,
  T12 extends object = object,
  T13 extends object = object,
  T14 extends object = object,
  T15 extends object = object,
  T16 extends object = object
> {
  contentType: string
  id: string
}

/**
 * @amplience_type
 */
// @ts-ignore
export interface ContentLink<
  T1 extends object = object,
  T2 extends object = object,
  T3 extends object = object,
  T4 extends object = object,
  T5 extends object = object,
  T6 extends object = object,
  T7 extends object = object,
  T8 extends object = object,
  T9 extends object = object,
  T10 extends object = object,
  T11 extends object = object,
  T12 extends object = object,
  T13 extends object = object,
  T14 extends object = object,
  T15 extends object = object,
  T16 extends object = object
> {
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
