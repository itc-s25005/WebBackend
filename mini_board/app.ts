import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import {URL} from 'node:url'
import consumers from 'node:stream/consumers'
import qs from 'node:querystring'

// 静的ファイルとテンプレートの読み込み
const styleCss = await fs.readFile('./style.css', 'utf8')
const indexJs = await fs.readFile('./client/index.js', 'utf8')
const loginJs = await fs.readFile('./client/login.js', 'utf8')
const indexPug = pug.compileFile('./index.pug')
const loginPug = pug.compileFile('./login.pug')

// アプリケーションの設定値(定数)
const MAX_MESSAGE = 10
const DATA_FILENAME = 'mydata.txt'

// 投稿メッセージのデータ保管用
const messageData = await readFromFile()

// HTTPサーバー
const server = http.createServer(getFromClient)

server.listen(3000)
console.log('Server start!')

// ここまでメインプログラム==========

// 投稿内容のデータ構造を定義
interface MessageItem {
  id: string
  msg: string
}

// createServerの処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
  const reqUrl = new URL(req.url || '', 'http://localhost:3000')

  switch (reqUrl.pathname) {
    case '/':
      await responseIndex(req, res)
      break
    case '/login':
      await responseLogin(req, res)
      break
    case '/style.css':
      res.setHeader('Content-Type', 'text/css')
      res.write(styleCss)
      res.end()
      break
    case '/index.js':
      res.setHeader('Content-Type', 'text/javascript')
      res.write(indexJs)
      res.end()
      break
    case '/login.js':
      res.setHeader('Content-Type', 'text/javascript')
      res.write(loginJs)
      res.end()
      break
    default:
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      res.write('Not Found')
      res.end()
      break
  }
}

// /loginのアクセス処理
async function responseLogin(req: http.IncomingMessage, res: http.ServerResponse) {
  const content = loginPug()
  res.setHeader('Content-Type', 'text/html')
  res.write(content)
  res.end()
}

// /(index)のアクセス処理
async function responseIndex(req: http.IncomingMessage, res: http.ServerResponse) {
  // POSTアクセス時以外の処理
  if (req.method !== 'POST') {
    writeIndex(req, res)
    return
  }

  // POSTアクセス時の処理
  const body = await consumers.text(req)
  const data = qs.parse(body)
  if (data) {
    await addToData(data)
  }

  // リダイレクト
  res.statusCode = 303
  res.setHeader('Location', '/')
  res.setHeader('Content-Type', 'text/plain')
  res.write('See Other')
  res.end()
}

// indexページの出力
function writeIndex(req: http.IncomingMessage, res: http.ServerResponse) {
  const content = indexPug({
    data: messageData,
  })
  res.setHeader('Content-Type', 'text/html')
  res.write(content)
  res.end()
}

// テキストファイルをロード
async function readFromFile(): Promise<MessageItem[]> {
  const dataStr = await fs.readFile(DATA_FILENAME, 'utf8')
  return JSON.parse(dataStr || '[]')
}

// データを更新
async function addToData(data: qs.ParsedUrlQuery) {
  // 型チェック(どれか1つでも引っかかったらダメ)
  if (
    !data.id || typeof data.id !== 'string'
    || !data.msg || typeof data.msg !== 'string'
  ) {
    return  // 想定通りのデータじゃないので何もしないで終了
  }

  messageData.unshift({id: data.id, msg: data.msg})

  // データの件数チェックして上限を超えていたら古いものを1個取り出す(削除)
  if (messageData.length > MAX_MESSAGE) {
    messageData.pop()
  }

  // 投稿データを保存(永続化)する
  await saveToFile()
}

// データをファイルに保存
async function saveToFile() {
  const dataStr = JSON.stringify(messageData)
  await fs.writeFile(DATA_FILENAME, dataStr, 'utf8')
}


