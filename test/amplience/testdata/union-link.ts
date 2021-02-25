import { ContentReference } from '../../../src/amplience'

export interface HomePage {
  title: string
}
export interface CategoryPage {
  title: string
}
export interface ContentPage {
  title: string
}

/**
 * A Link to a page
 * @partial
 */
export interface UnionLink {
  page: ContentReference<Page>
}

type Page = HomePage | CategoryPage | ContentPage
