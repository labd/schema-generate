/** @content */
export interface SomeContent {
  test: string
}

/** @content */
export interface SomeOtherContent {
  test: string
}

/** @partial */
export interface ContentLink {
  /** @link */
  test: SomeContent
  /** @link */
  test2: SomeContent | SomeOtherContent
}
