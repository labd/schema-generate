import { ContentItem, DynamicContent } from 'dc-management-sdk-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
config()

const client = new DynamicContent({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
})

export const test = async () => {
  const hubId = process.env.HUB_ID ?? '5f9177ab4cedfd0001bfcc43'
  const hub = await client.hubs.get(hubId)

  const result = (await hub.related.contentRepositories.list()).getItems()
  console.log(result.map((x) => x.toJSON()))
}

export const importContentItems = async (dir: string) => {
  const jsons = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')))

  for (const json of jsons) {
    const contentItem = await client.contentItems.get(json.id)
    const newJson = { ...contentItem.toJSON(), body: json.body }
    const result = await contentItem.related.update(new ContentItem(newJson))
    console.log(`updated ${result.label}`)
  }
}

export const importContentItems2 = async (contentItems: ContentItem[], hubId: string) => {
  const hub = await client.hubs.get(hubId)
  for (const contentItem of contentItems) {
    if (!contentItem.id) {
      const result = await (await hub.related.contentRepositories.list())
        .getItems()[0]
        .related.contentItems.create(contentItem)
      console.log(`created ${result.label}`)
    } else {
      const result = await contentItem.related.update(contentItem)
      console.log(`updated ${result.label}`)
    }
  }
}

// export const validateContentItem = async (item: ContentItem) => {
// item.related.
// }
