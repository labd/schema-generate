/**
 * @directive cacheControl(maxAge: 20)
 */
export interface A {
  /**
   * @directive cacheControl(maxAge: 10, scope: PRIVATE)
   */
  b: number
  /**
   * @directive deprecated
   * @directive cacheControl(maxAge: 10, scope: PRIVATE)
   */
  c: number
}
