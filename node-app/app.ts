import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import {URL} from 'node:url'


const indexPug = pug.compileFile('./index.pug')
const otherPug = pug.compileFile('./other.pug')
const styleCss = await fs.readFile('./style.css', 'utf8')


const server = http.createServer(getFromClient)

server.listen(3000)
console.log('Server start!')

// ここまでメインプログラム==========

// createServerの処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const reqUrl = new URL(req.url || '', 'http://localhost:3000')

    switch (reqUrl.pathname) {
        case '/': {
            const content = indexPug({
                title: 'Index',
                content: 'これはテンプレートを使ったサンプルページです！',
            })
            res.setHeader('Content-Type', 'text/html')
            res.write(content)
            res.end()
            break
        }
        case '/other': {
            const content = otherPug({
                title: 'Other',
                content: 'これは新しく用意したページです！',
            })
            res.setHeader('Content-Type', 'text/html')
            res.write(content)
            res.end()
            break
        }
        case '/style.css': {
            res.setHeader('Content-Type', 'text/css')
            res.write(styleCss)
            res.end()
            break
        }
        default:
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain')
            res.end('Not Found')
            break
    }
}