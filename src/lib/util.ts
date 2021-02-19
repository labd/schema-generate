import ts from 'typescript'

export const hasTag = (symbol: ts.Symbol, name: string) =>
  symbol.getJsDocTags().some((t) => t.name === name)

export const findTag = (symbol: ts.Symbol, name: string) =>
  symbol.getJsDocTags().find((t) => t.name === name)

export const hasTypeFlag = (type: ts.Type, flag: ts.TypeFlags) => (type.flags & flag) === flag

export const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags) =>
  (symbol.flags & flag) === flag

export const isValue = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

export const maybeToNumber = (value: string | undefined) => (value ? Number(value) : undefined)
