export interface AmplienceContentTypeJsonFiles {
  name: string
  contentTypeSchema: AmplienceContentType
  contentTypeSchemaBody: AmplienceContentTypeSchema
  contentType?: AmplienceContentTypeSettings
}
export interface AmplienceContentType {
  body: string
  schemaId: string
  validationLevel: string
}

export interface AmplienceContentTypeSettings {
  contentTypeUri: string
  status: string
  settings: {
    label: string
    icons: { size: number; url: string }[]
    visualizations: any[]
    cards: any[]
  }
}

export interface AmplienceContentTypeSchema {
  $id: string
  $schema: string
  allOf: any[]
  title: string
  description: string
  'trait:filterable'?: {},
  'trait:hierarchy'?: {},
  'trait:sortable'?: {},
  type: 'object'
  properties?: { [name: string]: AmpliencePropertyType }
  definitions?: { [name: string]: AmpliencePropertyType }
  propertyOrder?: string[]
  required?: string[]
}

export interface AmpliencePropertyType {
  title?: string
  description?: string
  type?: string
  const?: any
  enum?: string[]
  allOf?: { [key: string]: any }[]
  items?: AmpliencePropertyType
  properties?: any
  propertyOrder?: string[]
  required?: string[]
  format?: string
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  minimum?: number
  maximum?: number
  examples?: string[]
}

export interface GeneratorConfig {
  visualizations: Visualization[]
  schemaHost: string
}

export interface Visualization {
  templatedUri: string
  label: string
  default: boolean
}
