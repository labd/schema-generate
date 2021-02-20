export interface A {
  a: string
  b?: string
  c: string[]
  d?: string[]
  e: number
}

export interface B {
  a: A
  b?: A
  c: A[]
  d?: A[]
}
