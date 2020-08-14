module.exports = (options) => {
  const { assetPath, basePath, collections } = options
  if (!assetPath) {
    throw "Please specify `assetPath` in the plugin options."
  }
  if (!basePath) {
    throw "Please specify `basePath` in the plugin options."
  }
  if (!collections) {
    throw "Please specify at least one collection."
  }

  return {
    plugins: [
      {
        resolve: `gatsby-transformer-json`,
        options: {
          typeName: ({ node, object, isArray }) =>
            `${node.sourceInstanceName}CategoriesJson`,
        },
      },
      "gatsby-plugin-react-helmet",
      "gatsby-plugin-open-graph-images",
      "gatsby-transformer-sharp",
      "gatsby-plugin-sharp",
      {
        resolve: "gatsby-plugin-mdx",
        options: {
          extensions: [".mdx", ".md"],
          gatsbyRemarkPlugins: [
            {
              resolve: "gatsby-remark-images",
              options: {
                // should this be configurable by the end-user?
                maxWidth: 1380,
                linkImagesToOriginal: false,
              },
            },
            { resolve: "gatsby-remark-copy-linked-files" },
            { resolve: "gatsby-remark-smartypants" },
          ],
          remarkPlugins: [require("remark-slug")],
        },
      },
      {
        resolve: "gatsby-plugin-favicon",
        options: {
          logo: "./src/favicon.png",
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: true,
            yandex: false,
            windows: false,
          },
        },
      },
      {
        resolve: "gatsby-source-filesystem",
        options: {
          path: `${basePath}/${assetPath}`,
          name: assetPath,
        },
      },
    ].concat(
      collections.map((collection) => ({
        resolve: "gatsby-source-filesystem",
        options: {
          path: `${basePath}/${collection}`,
          name: collection,
        },
      }))
    ),
  }
}
