import { AmplienceContentTypeJsonFiles } from 'amplience/amplience_types'
import fs from 'fs'
import path from 'path'

export const writeContentTypeToDir = (input: AmplienceContentTypeJsonFiles, outputDir: string) => {
  fs.mkdirSync(`${outputDir}/content-types`, { recursive: true })
  fs.mkdirSync(`${outputDir}/content-type-schemas/schemas`, { recursive: true })

  fs.writeFileSync(
    path.join(outputDir, 'content-types', `${input.name}.json`),
    JSON.stringify(input.contentTypeSettings, null, 2)
  )
  fs.writeFileSync(
    path.join(outputDir, 'content-type-schemas', `${input.name}.content-type.json`),
    JSON.stringify(input.contentType, null, 2)
  )
  fs.writeFileSync(
    path.join(outputDir, 'content-type-schemas', 'schemas', `${input.name}-schema.json`),
    JSON.stringify(input.contentTypeSchema, null, 2)
  )
}
