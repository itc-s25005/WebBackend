import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import {URL} from 'node:url'
import qs from 'node:querystring'
import consumers from 'node:stream/consumers'

const indexPug = pug.compileFile('./index.pug')
const otherPug = pug.compileFile('./other.pug')
const styleCss = await fs.readFile('./style.css', 'utf8')


const server = http.createServer(getFromClient)

server.listen(3000)
console.log('Server start!')

// ここまでメインプログラム==========

// 追加するデータ用変数
const data = {
    msg: 'no message...'
}

// createServerの処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const reqUrl = new URL(req.url || '', 'http://localhost:3000')

    switch (reqUrl.pathname) {
        case '/': {
            await responseIndex(req, res)
            break
        }
        case '/other': {
            await responseOther(req, res)
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

// index のアクセス処理
async function responseIndex(req: http.IncomingMessage, res: http.ServerResponse) {
    // POST以外でアクセス時の処理
    if (req.method !== 'POST') {
        writeIndex(req, res)
        return
    }
    // POSTアクセス時の処理
    const rawBody = await consumers.text(req)
    const body = qs.parse(rawBody)
    data.msg = String(body.msg)

    // Cookieの保存
    setCookie('msg', data.msg, res)

    // writeIndex(req, res)           // ←ダサいので今どきやらない
    res.statusCode = 303              // 303のステータスコードを設定
    res.setHeader('Location', '/')    // リダイレクト(転送)先の指定
    res.setHeader('Content-Type', 'text/plain')
    res.write('303 See Other')
    res.end()
}

function writeIndex(req: http.IncomingMessage, res: http.ServerResponse) {
    const content = indexPug({
        title: 'Index',
        content: '※伝言を表示します。',
        data: data,
        cookieData: getCookie('msg', req)
    })
    res.setHeader('Content-Type', 'text/html')
    res.write(content)
    res.end()
}

function setCookie(key: string, value: string, res: http.ServerResponse) {
    const cookie = qs.stringify({[key]: value})
    res.setHeader('Set-Cookie', cookie)
}

function getCookie(key: string, req: http.IncomingMessage) {
    const data = qs.parse(req.headers.cookie || '', '; ')
    return String(data[key] || '')
}

// other のアクセス処理
async function responseOther(req: http.IncomingMessage, res: http.ServerResponse) {
    const content = otherPug({
        title: 'Other',
        content: 'これはOtherページです。',
        data: {},
    })
    res.setHeader('Content-Type', 'text/html')
    res.write(content)
    res.end()
}