# gatsby-theme-content-collections

A Gatsby theme for MDX content organized by collections

## Installation

Install as a dependency to your Gatsby site

```
npm install gatsby-theme-content-collections
```

add the following to your `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-content-collections`,
      options: {
        basePath: "content", // This is the directory where the content is stored
        assetPath: "assets", // Path to assets referenced in the content relative to basePath
        collections: ["posts", "events"] // Collection folder / names relative to basePath
      }
    }
  ]
}
```

Add `*.md` or `*.mdx` files to collection's directories `/content/posts` and `/content/events`.

If you want to use categories, add `categories.json` with the following structure to each collection directory:

```json
{
  "categories": [
    {
      "id": "Tag"
    }
  ]
}
```

`id` is the only required field. You can add additional fields, and they will be available to you via GraphQL on the `category` type.

Default types for `Category` and `Post` are:

```graphql
type Category implements Node {
  id: ID!
  collection: String
  slug: String!
  posts: [Post]!
  postCount: Int!
  isTag: Boolean
}

type Post implements Node {
  id: ID!
  body: String
  categories: [Category] @link(from: "categories.value")
  coverImage: File
  collection: String
  date: Date @dateformat
  slug: String
  title: String
}
```

Use schema overwrites in your `gatsby-node` if you want to extend them.
