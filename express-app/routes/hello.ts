import {Router, type Request, type Response} from 'express'

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

router.get('/', async (req: Request<{}, {}, {}, IndexQuery>, res: Response) => {
  // const name = req.query.name
  // const email = req.query.email
  const data = {
    title: 'Hello!',
    content: '※なにか書いて送信してください。'
  }
  res.render('hello', data)
})

router.post('/post', async (req: Request<{}, {}, PostRequestBody>, res: Response) => {
  const msg = req.body.message
  const data = {
    title: 'Hello!',
    content: `あなたは「${msg}」と送信しました`
  }
  res.render('hello', data)
})

export default router