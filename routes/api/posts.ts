import type {NextFunction, Request, Response} from 'express'
import {Router} from 'express'
import {body, matchedData, param, validationResult} from 'express-validator'
import {prisma} from '../../libs/prisma'

// 1ページあたりの投稿数
const POST_PER_PAGE = Number(process.env.POST_PER_PAGE) || 5

const router = Router()

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
        author: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    })
    res.json({
      posts,
      page,
    })
  },
)

export default router