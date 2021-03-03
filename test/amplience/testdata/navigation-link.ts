import { ContentReference } from '../../../src/amplience'

export interface HomePage {
  title: string
}
export interface InformationPage {
  title: string
}
export interface ProductOverviewPage {
  title: string
}

/**
 * A Link to a page
 * @partial
 */
export interface NavigationLink {
  /**
   * A reference to a page you would like to link to.
   */
  value: ContentReference<HomePage | InformationPage | ProductOverviewPage>
  /**
   * The label that will be displayed for this link.
   * @minLength 3
   * @maxLength 200
   */
  label: string
  /** Open the link in a new tab */
  newTab: boolean
}
