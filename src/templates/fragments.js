import { graphql } from "gatsby"

export const query = graphql`
  fragment Categories on Post {
    categories {
      id
      slug
      isTag
    }
  }
  fragment PostMeta on Post {
    id ## Required for search to work
    slug
    title
    coverImage {
      childImageSharp {
        fluid(maxWidth: 300) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    ...Categories
  }
  fragment PostContent on Post {
    date(locale: "de", formatString: "DD MMMM YYYY")
    title
    body
    coverImage {
      childImageSharp {
        fluid(maxWidth: 1024) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    coverImageAuthor
    coverImageLink
  }
`
