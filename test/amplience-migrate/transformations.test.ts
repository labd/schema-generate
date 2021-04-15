import {
  deleteProperty,
  addProperty,
  localize,
  renameProperty,
  transformProperty,
  unLocalize,
} from '../../src/amplience-migrate/transformations'

const a = { a: 1, b: '2' }
test('deleteProperty', () => {
  expect(deleteProperty(a, 'a')).toEqual({ b: '2' })
})
test('renameProperty', () => {
  expect(renameProperty(a, 'a', 'c')).toEqual({ c: 1, b: '2' })
})
test('addProperty', () => {
  expect(addProperty(a, 'c', ({ a }) => a)).toEqual({ a: 1, b: '2', c: 1 })
})
test('transformProperty', () => {
  expect(transformProperty(a, 'b', (b) => localize(b, 'nl-NL'))).toEqual({
    a: 1,
    b: {
      values: [{ locale: 'nl-NL', value: '2' }],
      _meta: { schema: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value' },
    },
  })

  expect(
    transformProperty(
      {
        a: 1,
        b: {
          values: [{ locale: 'nl-NL', value: '2' }],
          _meta: {
            schema: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
          },
        },
      },
      'b',
      (b) => unLocalize(b, 'nl-NL', '')
    )
  ).toEqual(a)
})

test('complex object', () => {
  const input = [
    {
      name: 'bla',
      items: [{ a: 1, b: 2 }],
    },
    {
      name: 'bla2',
      items: [{ a: 3, b: 4 }],
    },
  ]

  const result = input
    .map((x) => addProperty(x, 'x', () => 'default'))
    .map((x) => renameProperty(x, 'name', 'title'))

  expect(result).toEqual([
    {
      x: 'default',
      title: 'bla',
      items: [{ a: 1, b: 2 }],
    },
    {
      x: 'default',
      title: 'bla2',
      items: [{ a: 3, b: 4 }],
    },
  ])
})
