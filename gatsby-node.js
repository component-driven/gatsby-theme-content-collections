const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")
const Debug = require("debug")
const slug = require("slug")
const pkg = require("./package.json")
const { createOpenGraphImage } = require("gatsby-plugin-open-graph-images")
const { createFilePath } = require("gatsby-source-filesystem")

const debug = Debug(pkg.name)

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, pluginOptions) => {
  const { basePath, assetPath, collections } = pluginOptions
  const { program } = store.getState()
  const dirs = [...collections, assetPath].map((collection) =>
    path.join(program.directory, basePath, collection)
  )

  dirs.forEach((dir) => {
    debug("Initializing ${dir} directory")
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

const mdxResolverPassthrough = (fieldName) => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType("Mdx")
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  })
  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  })
  return result
}

exports.sourceNodes = ({ actions, schema }) => {
  const { createTypes } = actions
  const typeDefs = `
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
  `
  createTypes(typeDefs)
}

exports.createResolvers = ({ createResolvers, schema }) => {
  createResolvers({
    Post: {
      body: {
        type: "String",
        resolve: mdxResolverPassthrough("body"),
      },
    },
    Category: {
      posts: {
        type: "[Post]",
        async resolve(source, args, context, info) {
          const res = await context.nodeModel.runQuery({
            query: {
              filter: {
                categories: {
                  elemMatch: { id: { eq: source.id } },
                },
              },
              sort: { fields: ["title"], order: ["ASC"] },
            },
            type: "Post",
            firstOnly: false,
          })
          if (res === null) {
            return []
          }
          return res
        },
      },
      postCount: {
        type: "Int!",
        async resolve(source, args, context, info) {
          const res = await context.nodeModel.runQuery({
            query: {
              filter: {
                categories: {
                  elemMatch: { id: { eq: source.id } },
                },
              },
            },
            type: "Post",
            firstOnly: false,
          })
          if (res === null) {
            return 0
          }
          return res.length
        },
      },
    },
  })
}

exports.onCreateNode = (
  { node, actions, getNode, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { basePath, collections } = pluginOptions
  const { createNode, createParentChildLink } = actions
  if (node.internal.type.includes(`CategoriesJson`)) {
    const parent = getNode(node.parent)
    const categoriesNode = node.categories
    if (categoriesNode == null) {
      return
    }
    categoriesNode.forEach((obj) => {
      const jsonNode = {
        ...obj,
        collection: parent.sourceInstanceName,
        slug: `/${parent.sourceInstanceName}/${slug(obj.id)}`,
        children: [],
        parent: node.id,
        internal: {
          contentDigest: createContentDigest(obj),
          type: "Category",
        },
      }
      createNode(jsonNode)
      createParentChildLink({ parent: node, child: jsonNode })
    })
  }
  if (node.internal.type === "Mdx") {
    const { frontmatter } = node
    const parent = getNode(node.parent)

    function getType(path) {
      if (collections.includes(path)) {
        return "Post"
      }
      return null
    }

    const path = parent.sourceInstanceName
    const type = getType(path)
    if (type == null) {
      return // Do not create additional node if there is no match
    }
    const slug = createFilePath({ node, getNode, basePath })
    const fieldData = {
      ...frontmatter,
      slug: `/${path}${slug}`,
    }

    createNode({
      ...fieldData,
      collection: path,
      // Required fields.
      id: createNodeId(`${node.id} >>> ${type}`),
      parent: node.id,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(fieldData),
        content: JSON.stringify(fieldData),
      },
    })
    createParentChildLink({
      parent: parent,
      child: node,
    })
  }
}

exports.createPages = async ({ graphql, actions, reporter }, pluginOptions) => {
  const { collections } = pluginOptions
  const { createPage } = actions
  const result = await graphql(`
    {
      allPost(sort: { fields: [date, title], order: DESC }) {
        nodes {
          id
          slug
          title
          collection
          coverImage {
            childImageSharp {
              fluid(maxWidth: 300) {
                tracedSVG
                src
                srcSet
                aspectRatio
              }
            }
          }
        }
      }
      allCategory {
        nodes {
          id
          slug
          collection
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  // Create Posts and Post pages.
  const { allPost, allCategory } = result.data

  // Create a page for each Post
  allPost.nodes.forEach((post, index) => {
    const ogImage = createOpenGraphImage(createPage, {
      path: `/og-images/${post.id}.png`,
      component: path.resolve(`${__dirname}/src/templates/post-og-image.js`),
      context: {
        ...post,
      },
    })
    createPage({
      path: post.slug,
      component: path.resolve(`${__dirname}/src/templates/post.js`),
      context: {
        id: post.id,
        collection: post.collection,
        ogImage,
      },
    })
  })

  allCategory.nodes.forEach(({ id, slug, collection }) => {
    createPage({
      path: slug,
      component: path.resolve(`${__dirname}/src/templates/category.js`),
      context: {
        id,
        collection,
      },
    })
  })

  // Create the index page for each collection
  collections.forEach((collection) =>
    createPage({
      path: collection,
      component: path.resolve(`${__dirname}/src/templates/posts.js`),
      context: {
        collection,
      },
    })
  )
}
