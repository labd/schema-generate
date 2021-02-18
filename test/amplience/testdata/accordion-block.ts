export interface AccordionItem {
  /**
   * Title of the accordion item
   * @localized
   */
  title: string
  /**
   * @localized
   * @format markdown
   */
  content: string
}

/**
 * A block with alert styling that contains markdown text
 * @content
 */
export interface AccordionBlock {
  /**
   * Title of the accordion
   * @localized
   */
  title: string
  items: AccordionItem[]
}
