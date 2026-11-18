import * as http from 'node:http'

const server = http.createServer(
  ( request, response) => {
    response.end('Hello, Node.js!')
  }
)
server.listen(3000);