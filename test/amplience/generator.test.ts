import { generateJson } from '../../src/amplience'
import fs from 'fs'

const readJson = (path: string) => JSON.parse(fs.readFileSync(path, 'utf-8'))

it.each(['accordion-block'])('correct JSON files for content type', () => {
  const name = 'accordion-block'
  const jsonPath = './test/amplience/testdata/json'
  const result = generateJson([`./test/amplience/testdata/${name}.ts`])[0]
  const contentType = readJson(`${jsonPath}/content-type-schemas/${name}.content-type.json`)
  const contentTypeSchema = readJson(`${jsonPath}/content-type-schemas/schemas/${name}-schema.json`)
  const contentTypeSettings = readJson(`${jsonPath}/content-types/${name}.json`)

  expect(result).toEqual({
    name,
    contentTypeSchema,
    contentType,
    contentTypeSettings,
  })
})
