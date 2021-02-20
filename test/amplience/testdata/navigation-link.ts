import { ContentReference } from '../../../src/amplience'

/**
 * A Link to a page
 * @partial
 */
export interface NavigationLink {
  /**
   * A reference to a page you would like to link to.
   * @enum
   * | HomePage
   * | InformationPage
   * | ProductOverviewPage
   */
  value: ContentReference
  /**
   * The label that will be displayed for this link.
   * @minLength 3
   * @maxLength 200
   */
  label: string
  /** Open the link in a new tab */
  newTab: boolean
}
