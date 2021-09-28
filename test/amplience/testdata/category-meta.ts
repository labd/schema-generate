/**
 * @content
 */
export interface CategoryMeta {
  title: string
  description?: string
  /** @sortable */
  order: number
  /** @filterable */
  prettyURL: string
  /**
   * @filterable
   */
  categoryCode: string
  /** @filterable */
  shortCode: string
}
