import { readConfig } from '../../src/amplience/io'

test('full', () => {
  expect(readConfig('./test/amplience/testdata/config-full.yaml')).toEqual({
    schemaHost: 'test',
    visualizations: [
      { label: 'test', templatedUri: 'test', default: false },
      { label: 'test2', templatedUri: 'test2', default: false },
    ],
  })
})

test('config-invalid throws an error', () => {
  expect(() => readConfig('./test/amplience/testdata/config-invalid.yaml')).toThrow(Error)
})

test('schemahost', () => {
  expect(readConfig('./test/amplience/testdata/config-schemahost.yaml')).toEqual({
    schemaHost: 'test',
    visualizations: [],
  })
})
