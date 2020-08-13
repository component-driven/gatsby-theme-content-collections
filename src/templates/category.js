import { graphql } from "gatsby"
import CategoryPage from "../components/CategoryPage"
export default CategoryPage
export const query = graphql`
  query CategoryQuery($id: String!) {
    category(id: { eq: $id }) {
      id
      postCount
      posts {
        ...PostMeta
      }
    }
  }
`
