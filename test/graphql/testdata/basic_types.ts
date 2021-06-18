export interface A {
  a: string
  b?: string
  c: string[]
  d?: string[]
  e: number
  /** @ignore */
  constString: 'const'
  /** @ignore */
  constArray: ['this', 'is', 'const']
}

export interface B {
  a: A
  b?: A
  c: A[]
  d?: A[]
}
