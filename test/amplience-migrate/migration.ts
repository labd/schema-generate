import { ContentItem } from 'dc-management-sdk-js'
import { unLocalize } from '../../src/amplience-migrate/transformations'
import siteFooter from './testdata/Site Footer.json'

const result = [
  new ContentItem({
    ...siteFooter,
    body: {
      uspList: siteFooter.body.usps.map((usp) => ({ label: unLocalize(usp.label, 'nl-NL', '') })),
      contact: { test: 1 },
      navigation: siteFooter.body.navigation,
    },
  }),
]

export default result
