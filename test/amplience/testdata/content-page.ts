/**
 * A block with markdown text
 *
 * @content
 */
export interface MarkdownBlock {
  /**
   * Localized rich text for this locale
   * @localized
   * @format markdown
   */
  content: string
}

/**
 * A block with a Youtube video
 * @content
 */
export interface YoutubeBlock {
  /** The ID a of a youtube video. The "v" part of the url, e.g. https://www.youtube.com/watch?v=<YoutubeId>&t=123 */
  youtubeId: string
}

export type Content = MarkdownBlock | YoutubeBlock

/**
 * A generic page that
 * @slot
 */
export interface ContentPage {
  title: string
  content: Content[]
}
