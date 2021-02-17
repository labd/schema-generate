import ts from 'typescript'

const schemaHost = 'https://schema-examples.com'

export const generateJson = (fileNames: string[]) => {
  const program = ts.createProgram(fileNames, {})
  const checker = program.getTypeChecker()

  return fileNames
    .map(f => program.getSourceFile(f)!)
    .flatMap(sourceFile =>
      sourceFile
        .getChildAt(0)
        .getChildren()
        .filter(ts.isInterfaceDeclaration)
        .map(node => serializeInterface(node, checker))
    )
}

const serializeInterface = (node: ts.InterfaceDeclaration, checker: ts.TypeChecker) => ({
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: `${schemaHost}/${node.name.text.toLowerCase()}`,
  title: node.name.text,
  description: getDescription(node.name, checker),
  type: 'object',
  properties: {
    _meta: { $ref: 'http://bigcontent.io/cms/schema/v1/core#/definitions/meta' },
    ...Object.fromEntries(node.members.map(p => serializeMember(p, checker))),
  },
  required: node.members.filter(m => !m.questionToken).map(n => n.name?.getText()),
})

const serializeMember = (node: ts.TypeElement, checker: ts.TypeChecker) => [
  node.name?.getText(),
  {
    title: node.name?.getText(),
    description: getDescription(node.name as ts.Identifier, checker),
    type: checker.typeToString(checker.getTypeAtLocation(node.name as ts.Identifier)),
    ...getTags(node.name as ts.Identifier, checker),
  },
]

const getDescription = (identifier: ts.Identifier, checker: ts.TypeChecker) =>
  ts.displayPartsToString(checker.getSymbolAtLocation(identifier)?.getDocumentationComment(checker))

const getTags = (identifier: ts.Identifier, checker: ts.TypeChecker) =>
  Object.fromEntries(
    checker
      .getSymbolAtLocation(identifier)
      ?.getJsDocTags()
      .filter(tag => tag.name !== 'type')
      .map(tag => [tag.name, isNaN(Number(tag.text)) ? tag.text : Number(tag.text)]) ?? []
  )
