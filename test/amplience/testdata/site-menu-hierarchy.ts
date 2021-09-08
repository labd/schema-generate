/**
 * @hierarchy
 */
export interface SiteMenuHierarchy {
  title: string
  description?: string
  /** @sortable */
  order: number
  /**
   * @children
   * Since this uses `@children` it won't be added as a field to the schema
   */
  titleOnlyItem: TitleOnlyItem[]
}

/**
 * @content
 */
export interface TitleOnlyItem {
  title: string
}
