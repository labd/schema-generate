import { generateGraphqlTypes } from '../../src/graphql'
import fs from 'fs'

const compare = (name: string) => ({
  result: generateGraphqlTypes([`./test/graphql/testdata/${name}.ts`]),
  expected: fs.readFileSync(`./test/graphql/testdata/${name}.graphql`, 'utf-8'),
})

it.each([
  'basic_types',
  'directives',
  'dummy_types',
  'enum_types',
  'interface',
  'localized_types',
  'markdown_types',
  'union_types',
])('generates correct %s', (name) => {
  const { result, expected } = compare(name)
  expect(result).toContain(expected)
})

it.each(['ignore_types'])('generates correct %s', (name) => {
  const { result, expected } = compare(name)
  expect(result).not.toContain(expected)
})
