# GraphQL

The GraphQL schema generator takes Typescript files with interfaces as input and generates GraphQL types as a result.

For example, given the following file called `books.ts`.

```ts
interface Author {
    name: string
}
interface Chapter {
    startPage: number
}
interface Book {
    id: string
    author: Author
    title: string
    subTitle?: string
    /** @float */
    pages: number
    chapters: Chapter[]
}
interface Game {
    title: string
}
type Product = Book | Game
```

You can generate the following GraphQL types:

```graphql
union Product = Book | Game
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
type Product {
    title: String!
}
```
