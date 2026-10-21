import {type Request, type Response, Router} from 'express'

const router = Router()

// / のクエリーパラメーターの型定義
interface IndexQuery {
  name: string
  email: string
}

// /post のリクエストボディの型定義
interface PostRequestBody {
  message: string
}

// /users のパスパラメータの定義
interface UsersParams {
  userId: string
  bookId: string
}

// /lang のパスパラメータの定義
interface LangParams {
  lang: string[]
}

router.get('/', async (req: Request, res: Response) => {
  const msg = req.session.message ? `Last Message: ${req.session.message}`
    : '※何か書いて送信してください。'
  const data = {
    title: 'Hello!',
    content: msg,
  }
  res.render('hello', data)
})

router.post('/post', async (req: Request<{}, {}, PostRequestBody>, res: Response) => {
  req.session.message = req.body.message
  const data = {
    title: 'Hello!',
    content: `Last Message: ${req.session.message}`,
  }
  res.render('hello', data)
})

router.get('/users/:userId{/:bookId}', async (req: Request<UsersParams>, res: Response) => {
  const userId = req.params.userId
  const bookId = req.params.bookId || '本は未指定'
  res.send(`userId: ${userId}, bookId: ${bookId}`)
})

router.get('/lang/*lang', async (req: Request<LangParams>, res: Response) => {
  const langs = req.params.lang.join(' & ')
  res.send(`select languages: ${langs}`)
})

export default router