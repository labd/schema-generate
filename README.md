# Schema Generate

This repository can generate schema files based on Typescript files containing interfaces.

Currently it only supports GraphQL types.

## GraphQL

The GraphQL schema generator takes Typescript files with interfaces as input and generates GraphQL types as a result.

For example, given the following file called `books.ts`.
```ts
export type CustomScalar = string & {__scalar?: undefined}
export interface Author {
    name: string
    custom: CustomScalar
}
export interface Chapter {
    startPage: number
}
export interface Book {
    id: string
    author: Author
    title: string
    subTitle?: string
    /** @float */
    pages: number
    chapters: Chapter[]
}
export interface Game {
    title: string
}
export type Product = Book | Game
```

You can generate the following GraphQL types:

```graphql
scalar CustomScalar
union Product = Book | Game
type Author {
    name: String!
    custom: CustomScalar!
}
type Chapter {
    startPage: Int!
}
type Book {
    id: ID!
    author: Author!
    title: String!
    subTitle: String
    pages: Float!
    chapters: [Chapter!]!
}
type Product {
    title: String!
}
```

Either by using the CLI

```bash
yarn schema-generate graphql books.ts
# or
yarn schema-generate graphql books.ts -o schema.graphql
```

Or calling the function directly

```ts
import { generateGraphqlTypes } from 'schema-generate/graphql'

const graphqlTypeString = generateGraphqlTypes(['books.ts'])
```

# How to release

First increase the version in package.json, then use that version to create a release with that number in Github.
