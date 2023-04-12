import { ActionFunction, json } from "@remix-run/node";
import { V2_MetaFunction, useLoaderData} from "@remix-run/react";
import { Form } from "@remix-run/react";


type Message = {
  id: string
  author: string
  body: string
  createdAt: string
}

type Data = {
  data: {
    messageCollection: { edges: { node: Message }[] }
  }
}


export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix + Grafbase App" }];
};


const GetAllMessagesQuery = /* GraphQL */ `
query GetAllMessages($first: Int!) {
  messageCollection(first: $first) {
    edges {
      node {
        id
        author
        body
        createdAt
      }
    }
  }
}
`

const MessageCreate = /* GraphQL */ `
mutation MessageCreate($author: String!, $body: String!) {
  messageCreate(
    input: { author: $author, body: $body }
  ) {
    message {
      id
    }
  }
}
`

export async function loader() {
  const response = await fetch('http://127.0.0.1:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: GetAllMessagesQuery,
      variables: {
        first: 100
      }
    })
  })

  return await response.json()
}

export async function action({ request } : {request: any}) {

  const formData = await request.formData();
  let author = formData.get("author")
  let body = formData.get("body")
  const response = await fetch('http://127.0.0.1:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: MessageCreate,
      variables: {
        author: author,
        body: body,
      }
    })
  })
   return await response.json()
}

export default function Index() {
  let messages = useLoaderData<typeof loader>()
  return (
    <main>
    <h3>Grafbase Messages</h3>
      <ul>
          {messages.data.messageCollection?.edges?.map(({node} : { node: any}) => (
            <li key={node.id}>
              {node.author} - {node.body} - {node.createdAt}
            </li>
          ))}
          <li>
            <Form method="post">
              <input type="text" name="author" /> {""}
              <input type="text" name="body" /> {""}
              <button type="submit">Add</button>
            </Form>
          </li>
      </ul>
  </main>
  );
}
