export interface MarkdownBlock {
  content: string
}

export interface YoutubeBlock {
  id: string
}

export type ContentBlock = MarkdownBlock | YoutubeBlock

export interface ContentPage {
  content: ContentBlock[]
}
