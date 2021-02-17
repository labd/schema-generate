type ID = string & { __ID?: undefined }
type Int = number & { __Int?: undefined }
type Float = number & { __Float?: undefined }

export interface A {
  a: ID
  b: Int
  c: Float
}
