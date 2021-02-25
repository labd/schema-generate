import { AmplienceContentTypeJsonFiles } from 'amplience/types'
import { paramCase } from 'change-case'
import fs from 'fs'
import path from 'path'

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
