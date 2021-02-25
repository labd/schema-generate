import { generateAmplienceSchemas } from '../../src/amplience'
import fs from 'fs'

const readJson = <T>(path: string) => JSON.parse(fs.readFileSync(path, 'utf-8')) as T

it.each([
  // ['content-type', 'accordion-block'],
  // ['partial', 'navigation-link'],
  // ['partial', 'usp'],
  // ['slot', 'site-footer'],
  // ['content-type', 'banner-slider-block'],
  // ['partial', 'union-link'],
  ['partial', 'enum'],
])('correct JSON files for %s %s', (type, name) => {
  const jsonPath = './test/amplience/testdata/expected'
  const result = pruned(
    generateAmplienceSchemas([`./test/amplience/testdata/${name}.ts`]).find((r) => r.name === name)
  )

  const contentType = readJson(`${jsonPath}/content-type-schemas/${name}.${type}.json`)
  const contentTypeSchema = readJson(`${jsonPath}/content-type-schemas/schemas/${name}-schema.json`)
  const contentTypeSettings =
    type !== 'partial' ? readJson(`${jsonPath}/content-types/${name}.json`) : undefined

  expect(result).toEqual(
    pruned({
      name,
      contentTypeSchema,
      contentType,
      contentTypeSettings,
    })
  )
})

/** Removes all undefined properties */
const pruned = <T>(object: T): Partial<T> => JSON.parse(JSON.stringify(object))
