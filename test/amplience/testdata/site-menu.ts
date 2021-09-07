/**
 * @hierarchy
 */
export interface SiteMenuItem {
  title: string
  description?: string
  /** @sortable */
  order: number
  /**
   * @link
   * @children
   */
  bla: Bla[]
}

/**
 * @content
 */
export interface Bla {
  title: string
}
