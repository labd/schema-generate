/**
 * Banner block
 * @content
 */
export interface BannerBlock {
  title: string
  subtitle: string
}

/**
 * A slider for banners
 * @content
 */
export interface BannerSliderBlock {
  /**
   * @minItems 1
   */
  items: BannerBlock[]
}
