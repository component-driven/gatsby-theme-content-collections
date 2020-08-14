# gatsby-theme-content-collections

A Gatsby theme for MDX content organized by collections

This plugin does:

1. Generates favicon from `src/favicon.png`
1. Sources the content from `basePath` and creates multiple collections based on your config
1. Create `category` and `post` GraphQL types and cross-reference them, so you can query all posts from a collection easily
1. Uses sharp transformer
1. Uses smartypants for good typography
1. It's not opinionated in terms of styling (bring your own)

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

Default type for `Post`:

```graphql
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

You can [customize the schema](https://www.gatsbyjs.com/docs/schema-customization/) in your `gatsby-node` if you want to extend them.

## Categories

If you want to categorize your content, add `categories.json` with the following structure to each collection directory:

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

Default type:

```graphql
type Category implements Node {
  id: ID!
  collection: String
  slug: String!
  posts: [Post]!
  postCount: Int!
}
```

You can [customize the schema](https://www.gatsbyjs.com/docs/schema-customization/) in your `gatsby-node` if you want to extend them.

## Rendering

This plugin uses Gatsby shadowing for customization. In order to customize how pages are rendered for each collection, you'd need to override following files:

```
src
├── components
│   ├── CategoryPage.js
│   ├── OgImage.js
│   ├── PostPage.js
│   └── PostsPage.js
└── templates
    ├── category.js
    ├── fragments.js
    ├── post-og-image.js
    ├── post.js
    └── posts.js
```

For example, if you want different pages to be rendered depending on a collection:

```jsx
import React from "react"
import BlogPostPage from "../../components/BlogPostPage"
import EventPage from "../../components/EventPage"

function PostPage(props) {
  switch (props.pageContext.collection) {
    case "posts": {
      return <BlogPostPage {...props} />
    }
    case "events": {
      return <EventPage {...props} />
    }
    default:
      return <h1>No page for this collection is defined</h1>
  }
}

export default PostPage
```

### Query all posts by a category

```graphql
query PostsByCategory {
  category(id: { eq: "categoryId" }) {
    id
    posts {
      id
    }
    postCount
  }
}
```

## Favicon

Add a `src/favicon.png` and to automatically generate icons using [gatsby-plugin-favicon](https://github.com/Creatiwity/gatsby-plugin-favicon) under the hood.
