import { graphql } from "gatsby"
import PostPage from "../components/PostPage"
export default PostPage
export const query = graphql`
  query PostQuery($id: String!) {
    post(id: { eq: $id }) {
      ...PostContent
      ...Categories
    }
  }
`
