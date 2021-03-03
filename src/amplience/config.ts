import { validate } from 'jsonschema'

export const configSchema = {
  type: 'object',
  properties: {
    schemaHost: { type: 'string' },
    visualizations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          templatedUri: { type: 'string' },
          default: { type: 'boolean' },
        },
        required: ['label', 'templatedUri', 'default'],
      },
    },
  },
}

export const defaultConfig = { schemaHost: 'https://schema-examples.com', visualizations: [] }

export const validateConfig = (result: object) => {
  const validation = validate(result, configSchema)
  if (!validation.valid) {
    throw new Error(validation.errors[0].message)
  }
  return { ...defaultConfig, ...result }
}
