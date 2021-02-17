import { generateJson } from '../../src/amplience'
import fs from 'fs'

it.skip('content-page', () => {
  const result = generateJson(['./test/amplience/testdata/content-page.ts'])

  const expected = JSON.parse(
    fs.readFileSync(`./test/amplience/testdata/schemas/content-page-schema.json`, 'utf-8')
  )
  console.log(JSON.stringify(result, null, 2))
  const page = result.find(r => r.title === 'ContentPage')
  expect(page).toContain(expected)
})
