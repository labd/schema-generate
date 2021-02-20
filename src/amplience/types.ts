export interface AmplienceContentTypeJsonFiles {
  name: string
  contentType: AmplienceContentType
  contentTypeSchema: AmplienceContentTypeSchema
  contentTypeSettings?: AmplienceContentTypeSettings
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
  type: 'object'
  properties?: { [name: string]: AmpliencePropertyType } | { _meta: { $ref: string } }
  definitions?: { [name: string]: AmpliencePropertyType }
  propertyOrder?: string[]
  required?: string[]
}

export interface AmpliencePropertyType {
  title?: string
  description?: string
  type?: string
  allOf?: { [key: string]: any }[]
  items?: AmpliencePropertyType
  properties?: any
  format?: string
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
}
