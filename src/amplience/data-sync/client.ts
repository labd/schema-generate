import { DynamicContent, ContentItem } from 'dc-management-sdk-js'
import { config } from 'dotenv'
config()

const names = [
  { name: 'knivesandtools-acceptance', id: '5f9177ab4cedfd0001bfcc43' },
  { name: 'brandsites-acceptance', id: '5f9179a9c9e77c0001d2482a' },
]

const client = new DynamicContent({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
})

const bla = async () => {
  // const hubs = await client.hubs.list()
  // console.log(hubs.getItems().map((i) => [i.name, i.id]))

  const hub = await client.hubs.get(names[0].id)
  console.log(hub.name)
  const items = await hub.related.contentItems.facet(
    { fields: [], returnEntities: true },
    { size: 1000, query: '' }
  )
  console.log(items.getItems().map((x) => x.related.update(new ContentItem())))

  // const schemas = generateAmplienceSchemas(['./src/schemas/wip.ts'])
  // for (const schema of schemas) {
  //   if (schema.contentTypeSettings) {
  //     hub.related.contentTypes.register(new ContentType(schema.contentTypeSettings))
  //   }
  //   ;(await hub.related.contentTypeSchema.list())
  //     .getItems()
  //     .find((x) => x.schemaId === schema.contentTypeSchema.$schema)
  //   // hub.related.contentTypeSchema.create(new ContentTypeSchema(schema.contentType))
  // }
  // ContentTypeSettings
}

bla()
