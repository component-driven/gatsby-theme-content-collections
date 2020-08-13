import { graphql } from "gatsby"
import PostsPage from "../components/PostsPage"
export default PostsPage
export const query = graphql`
  query PostsQuery {
    allPost(sort: { fields: [date, title], order: [DESC, ASC] }) {
      nodes {
        ...PostMeta
      }
    }
  }
`
