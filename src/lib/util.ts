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
