import { defaultConfig, validateConfig } from './config'
import { AmplienceContentTypeJsonFiles } from './types'
import { paramCase } from 'change-case'
import fs from 'fs'
import path from 'path'
import { parse } from 'yaml'

export const writeContentTypeToDir = (input: AmplienceContentTypeJsonFiles, outputDir: string) => {
  fs.mkdirSync(`${outputDir}/content-types`, { recursive: true })
  fs.mkdirSync(`${outputDir}/content-type-schemas/schemas`, { recursive: true })

  if (input.contentType) {
    fs.writeFileSync(
      path.join(outputDir, 'content-types', `${input.name}.json`),
      JSON.stringify(input.contentType, null, 2) + '\n'
    )
  }
  fs.writeFileSync(
    path.join(
      outputDir,
      'content-type-schemas',
      `${input.name}.${paramCase(input.contentTypeSchema.validationLevel)}.json`
    ),
    JSON.stringify(input.contentTypeSchema, null, 2) + '\n'
  )
  fs.writeFileSync(
    path.join(outputDir, 'content-type-schemas', 'schemas', `${input.name}-schema.json`),
    JSON.stringify(input.contentTypeSchemaBody, null, 2) + '\n'
  )
}

export const readConfig = (yamlPath?: string) => {
  if (!yamlPath) return defaultConfig

  const source = fs.readFileSync(yamlPath, 'utf-8')
  const result = parse(source)
  return validateConfig(result)
}
