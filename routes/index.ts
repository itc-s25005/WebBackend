import type {Request, Response} from 'express'
import {Router} from 'express'
import {body, matchedData, validationResult} from 'express-validator'
import {prisma} from '../libs/prisma'
import argon2 from 'argon2'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  res.render('index', {
    title: 'Login',
    form: {email: '', password: ''},
  })
})

router.post('/',
  body('email', 'E-Mailはメールアドレス形式で入力してください').trim().isEmail(),
  body('password', 'Passwordを入力してください').trim().notEmpty(),
  async (req: Request, res: Response) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      // フォームの入力値が妥当でなかった場合
      return res.render('index', {
        title: 'Login',
        form: req.body,
        errors: validationErrors.array(),
      })
    }

    const {email, password} = matchedData<{ email: string, password: string }>(req)
    // まずはメールアドレスだけを条件にユーザを取ってくる
    const user = await prisma.user.findUnique({where: {email}})

    if (!user) {
      // ユーザがnullということはメールアドレスが間違っている
      return res.render('index', {
        title: 'Login',
        form: {email, password},
        errors: [{msg: 'メールアドレスまたはパスワードが違います'}],  // セキュリティ安全的なメッセージ
      })
    }

    // パスワードの検証
    if (!await argon2.verify(user.password, password)) {
      // パスワードが違う
      return res.render('index', {
        title: 'Login',
        form: {email, password},
        errors: [{msg: 'メールアドレスまたはパスワードが違います'}],  // セキュリティ安全的なメッセージ
      })
    }

    // セッションにユーザモデルを保存
    req.session.login = user

    // ログイン後のページにリダイレクト
    const url = req.session.back || '/posts'
    req.session.back = undefined
    return res.redirect(url)
  },
)

export default router