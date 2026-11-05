import {type Request, type Response, Router} from 'express'
import {prisma} from '../libs/prisma'
import {body, matchedData, param, query, validationResult} from 'express-validator'
import {Prisma} from '../generated/prisma/client'

const router = Router()

const formValidators = [
  body('name', 'NAME は必ず入力してください').trim().notEmpty(),
  body('password', 'PASSWORD は必ず入力してください').trim().notEmpty(),
  body('email').trim(),
  body('age', 'AGE は0以上の整数で入力してください').toInt().isInt({min: 0}),
]

router.get('/',
  query('id').toInt().default(0),
  async (req: Request, res: Response) => {
    const {id} = matchedData<{ id: number }>(req)

    const users = id <= 0 ? await prisma.user.findMany()
      : await prisma.user.findMany({where: {id: {lte: id}}})
    res.render('users/index', {
      title: 'Users/Index',
      content: users,
    })
  },
)

router.get('/find',
  query('name').default(''),
  query('email').default(''),
  query('min').toInt().default(-1),
  query('max').toInt().default(-1),
  async (req: Request, res: Response) => {
    const {name, email, min, max} = matchedData<{
      name: string
      email: string
      min: number
      max: number
    }>(req)
    const whereAnd: Prisma.UserWhereInput[] = []
    const whereOr: Prisma.UserWhereInput[] = []

    if (name) {
      whereOr.push({name: {contains: name}})
    }
    if (email) {
      whereOr.push({email: {contains: email}})
    }
    if (whereOr.length > 0) {
      whereAnd.push({OR: whereOr})
    }
    if (min >= 0) {
      whereAnd.push({age: {gte: min}})
    }
    if (max >= 0) {
      whereAnd.push({age: {lte: max}})
    }

    const users = await prisma.user.findMany({
      where: {
        AND: whereAnd,
      },
    })

    res.render('users/index', {
      title: 'Users/Find',
      content: users,
    })
  },
)

router.get('/add', async (_req: Request, res: Response) => {
  res.render('users/add', {
    title: 'Users/Add',
    form: {name: '', password: '', email: '', age: ''},
  })
})

router.post('/add', formValidators, async (req: Request, res: Response) => {
  // バリデーションエラーのチェック
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('users/add', {
      title: 'Users/Add',
      form: req.body,
      errors: errors.array(),
    })
  }
  // バリデーション済みデータの取得
  const {name, password, email, age} = matchedData<{
    name: string
    password: string
    email: string
    age: number
  }>(req)
  // データの挿入
  await prisma.user.create({data: {name, password, email, age}})
  // リダイレクト
  return res.redirect('/users')
})

router.get('/edit/:id',
  param('id').toInt().isInt({min: 1}),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    // id が正しくない場合はリダイレクト
    if (!errors.isEmpty()) {
      return res.redirect('/users')
    }

    const {id} = matchedData<{ id: number }>(req)
    const user = await prisma.user.findUnique({where: {id}})

    if (!user) {
      // 指定の id に該当するユーザーが存在しない場合は何もせずにリダイレクト
      return res.redirect('/users')
    }

    res.render('users/edit', {
      title: 'Users/Edit',
      form: user,
    })
  },
)

router.post('/edit',
  body('id').toInt().isInt({min: 1}),
  formValidators,
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // バリデーションエラーならフォーム再入力
      return res.render('users/edit', {
        title: 'Users/Edit',
        form: req.body,
        errors: errors.array(),
      })
    }

    const {id, name, password, email, age} = matchedData<{
      id: number
      name: string
      password: string
      email: string
      age: number
    }>(req)

    await prisma.user.update({
      where: {id},
      data: {name, password, email, age},
    })

    return res.redirect('/users')
  },
)

export default router