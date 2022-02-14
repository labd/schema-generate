/** @partial */
export interface Base {
  /**
   * @minLength 2
   * @maxLength 4
   * @pattern ^/.*$
   * @example
   * one example
   * another example
   */
  text: string
  optionalText?: string
  /**
   * @minItems 1
   * @maxItems 10
   */
  textList: string[]
  optionalTextList?: string[]
  /**
   * @minimum 0
   * @maximum 10
   */
  integer: number
  optionalInteger?: number
  boolean: boolean
  constString: 'const'
  constArray: ['this', 'is', 'const']
  /** @ignoreAmplience */
  ignore: string
  /**
   * @default false
   */
  defaultBoolean: boolean
  /**
   * @default "this is a default string"
   */
  defaultString: string
  /**
   * @default 42
   */
  defaultNumber: number
}
