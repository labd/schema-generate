import { ContentItem, DynamicContent } from 'dc-management-sdk-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
config()

const client = new DynamicContent({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
})

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
