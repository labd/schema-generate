import ts from 'typescript'

/**
 * @param fileNames The filenames in the program that we want exports of
 */
export const getExportedTypes = (fileNames: string[], program: ts.Program) =>
  fileNames
    .map(program.getSourceFile)
    .filter(isValue)
    .flatMap(program.getTypeChecker().getSymbolAtLocation)
    .filter(isValue)
    .flatMap(program.getTypeChecker().getExportsOfModule)
    .map((s) => program.getTypeChecker().getTypeAtLocation(s.declarations[0]))

export const hasTag = (symbol: ts.Symbol, name: string) =>
  symbol.getJsDocTags().some((t) => t.name === name)

export const findTag = (symbol: ts.Symbol, name: string) =>
  symbol.getJsDocTags().find((t) => t.name === name)

export const findTags = (symbol: ts.Symbol, names: string[]) =>
  symbol.getJsDocTags().filter((t) => names.includes(t.name))

export const hasTypeFlag = (type: ts.Type, flag: ts.TypeFlags) => (type.flags & flag) === flag

export const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags) =>
  (symbol.flags & flag) === flag

export const isValue = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

export const maybeToNumber = (value: string | undefined) => (value ? Number(value) : undefined)

export const switchArray = <T>(
  type: ts.Type,
  checker: ts.TypeChecker,
  { ifArray, other }: { ifArray: (subType: ts.Type) => T; other: (type: ts.Type) => T }
) =>
  type.symbol?.name === 'Array'
    ? ifArray(checker.getTypeArguments(type as ts.TypeReference)[0])
    : other(type)

export const ifNotEmpty = <T, S>(items: T[], callback: (items: T[]) => S) =>
  items.length ? callback(items) : undefined

export const combinations = (array: string[]): string[][] => {
  const results = [[] as string[]] as string[][]
  for (const value of array) {
    const copy = [...results]
    for (const prefix of copy) {
      results.push(prefix.concat(value))
    }
  }
  return results.filter((c) => c.length).sort((a, b) => a.length - b.length)
}
export const uniqueBy =
  <T, S>(getValue: (item: T) => S) =>
  (v: T, i: number, s: T[]) =>
    s.findIndex((e) => getValue(e) === getValue(v)) === i
