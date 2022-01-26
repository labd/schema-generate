export type CustomScalar = string & { __scalar?: undefined }
export interface Author {
  name: string
  custom: CustomScalar
}
export interface Chapter {
  startPage: number
}
export interface Book {
  id: string
  author: Author
  title: string
  /**
   * @minLength 13
   * @maxLength 24
   * @pattern ^[0-9\-]+$
   * @example
   * 123-4-56-789012-3
   * 4567-8901-2
   */
  isbn?: string
  /** @float */
  pages: number
  chapters: Chapter[]
}
export interface Game {
  title: string
}
export type Product = Book | Game
