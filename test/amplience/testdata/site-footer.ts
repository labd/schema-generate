/**
 * A Unique Selling Point
 * @partial
 */
export interface Usp {
  /**
   * The label that will be displayed for this USP
   * @localized
   */
  label: string
}

/** Use this to create a column of important links */
export interface Column {
  /**
   * @minLength 0
   * @maxLength 20
   */
  title: string
  /**
   * @minItems 1
   * @maxItems 7
   */
  links: string[]
}

/**
 * The site configuration for the footer
 * @slot
 */
export interface SiteFooter {
  /**
   * @minItems 2
   * @maxItems 4
   */
  usps: Usp[]
  /** Use this to create a column of important links
   * @minItems 2
   * @maxItems 2
   */
  navigation: Column[]
  // contact: FooterContact
}
