import { generateJson } from '../../src/amplience'
import fs from 'fs'

it('accordion-block', () => {
  const name = 'accordion-block'
  const result = generateJson([`./test/amplience/testdata/${name}.ts`])

  const expected = JSON.parse(
    fs.readFileSync(`./test/amplience/testdata/schemas/${name}-schema.json`, 'utf-8')
  )
  const page = result.find((r) => r.$id.includes(name))
  expect(page).toEqual(expected)
})
