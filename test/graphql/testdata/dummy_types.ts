export type AmplienceImage = string & { __scalar?: undefined }

export interface A {
  id: string
  b: number
  /** @float */
  c: number
  image: AmplienceImage
}
