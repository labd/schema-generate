export interface A {
  a: string
}
export interface B {
  b: string
}

export type Union = A | B

export interface C {
  c: Union
}
