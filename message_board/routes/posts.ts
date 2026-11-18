import type {NextFunction, Request, Response} from 'express'
import {Router} from 'express'
import {body, matchedData, param, validationResult} from 'express-validator'
import {prisma} from '../libs/prisma'

// 1ページあたりの投稿数
const POST_PER_PAGE = Number(process.env.POST_PER_PAGE) || 5

const router = Router()

// ログインチェック(ミドルウェア)
router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.session.login) {
    // ログイン情報がないのでログインページに飛ばす
    req.session.back = '/posts'
    return res.redirect('/')
  }
  next()
})

// トップページ
router.get('/{:page}',
  param('page').toInt().default(1).customSanitizer(v => v < 1 ? 1 : v),
  async (req: Request, res: Response) => {
    //ページ番号を取り出す
    const {page} = matchedData<{ page: number }>(req)

    const posts = await prisma.post.findMany({
      skip: (page - 1) * POST_PER_PAGE,
      take: POST_PER_PAGE,
      orderBy: [
        {createdAt: 'desc'},
      ],
      include: {
        author: true,
      },
    })
    res.render('posts/index', {
      title: 'Posts',
      username: req.session.login?.name || '(名無し)',
      posts,
      page,
    })
  },
)

router.post('/add',
  body('msg').trim().notEmpty(),
  async (req: Request, res: Response) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
      // 何もしないで一覧へリダイレクト
      return res.redirect('/posts')
    }
    const {msg} = matchedData<{ msg: string }>(req)
    const user = req.session.login
    if (user) {
      await prisma.post.create({
        data: {
          message: msg,
          author: {connect: user},
        },
      })
    }
    res.redirect('/posts')
  },
)

router.get('/user/:userId{/:page}',
  param('userId').toInt(),
  param('page').toInt().default(1).customSanitizer(v => v < 1 ? 1 : v),
  async (req: Request, res: Response) => {
    const {userId, page} = matchedData<{ userId: number, page: number }>(req)
    // まずは対象のユーザを取ってくる
    const user = await prisma.user.findUnique({where: {id: userId}})
    if (!user) {
      // 対象のユーザが見つからないので全体の一覧に飛ばす
      return res.redirect('/posts')
    }

    // user に紐づく Post を取ってくる
    const posts = await prisma.post.findMany({
      where: {
        author: user,
      },
      skip: (page - 1) * POST_PER_PAGE,
      take: POST_PER_PAGE,
      orderBy: [
        {createdAt: 'desc'},
      ],
    })
    res.render('posts/user', {
      title: 'Posts',
      username: user.name || user.email,
      userId: user.id,
      posts,
      page
    })
  },
)

export default router