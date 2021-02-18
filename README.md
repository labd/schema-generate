# Schema Generate

This repository can generate schema files based on Typescript files containing interfaces.

Currently it only supports GraphQL types.

## GraphQL

The GraphQL schema generator takes Typescript files with interfaces as input and generates GraphQL types as a result.

For example, given the following file called `books.ts`.
```ts
import { ID, Int } from 'schema-generate/graphql'

interface Author {
    name: string
}

interface Chapter {
    startPage: Int
}

interface Book {
    id: ID
    author: Author
    title: string
    subTitle?: string
    pages: number
    chapters: Chapter[]
}
```

You can generate the following GraphQL types:

```graphql
type Author {
    name: String!
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
```

Either by using the CLI

```bash
yarn schema-generate graphql books.ts

```

Or calling the function directly

```ts
import { generateGraphqlTypes } from 'schema-generate/graphql'

generateGraphqlTypes(['books.ts'])
```