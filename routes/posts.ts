import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import {param, matchedData} from 'express-validator'
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
  param('page').toInt().default(1),
  async (req: Request, res: Response) => {
    //ページ番号を取り出す
    const {page} = matchedData<{page: number}>(req)

    const posts = await prisma.post.findMany({
      skip: (page - 1) * POST_PER_PAGE,
      take: POST_PER_PAGE,
      orderBy: [
        {createdAt: 'desc'}
      ],
      include: {
        author: true
      }
    })
    res.render('posts/index', {
      title: 'Posts',
      username: req.session.login?.name || '(名無し)',
      posts,
      page
    })
  }
)

export default router