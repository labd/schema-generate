import { generateAmplienceSchemas } from '../../src/amplience'
import fs from 'fs'

const readJson = <T>(path: string) => JSON.parse(fs.readFileSync(path, 'utf-8')) as T

it.each([
  ['content-type', 'accordion-block'],
  ['partial', 'navigation-link'],
  ['partial', 'usp'],
  ['slot', 'site-footer'],
  ['content-type', 'banner-slider-block'],
  ['partial', 'union-link'],
  ['partial', 'enum'],
  ['partial', 'image-links'],
  ['partial', 'custom-image-links'],
])('correct JSON files for %s %s', (type, name) => {
  const jsonPath = './test/amplience/testdata/expected'
  const result = pruned(
    generateAmplienceSchemas([`./test/amplience/testdata/${name}.ts`]).find((r) => r.name === name)
  )

  const contentTypeSchema = readJson(`${jsonPath}/content-type-schemas/${name}.${type}.json`)
  const contentTypeSchemaBody = readJson(
    `${jsonPath}/content-type-schemas/schemas/${name}-schema.json`
  )
  const contentType =
    type !== 'partial' ? readJson(`${jsonPath}/content-types/${name}.json`) : undefined

  expect(result).toEqual(
    pruned({
      name,
      contentTypeSchemaBody,
      contentTypeSchema,
      contentType,
    })
  )
})

/** Removes all undefined properties */
const pruned = <T>(object: T): Partial<T> => JSON.parse(JSON.stringify(object))

// slot with content link
// or content type with content reference
