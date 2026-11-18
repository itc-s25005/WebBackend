import {type Request, type Response, Router} from 'express'
import {Pool} from 'pg'
import {body, matchedData, query, validationResult} from 'express-validator'

const router = Router()

// データベースオブジェクト(プール)の生成
const dbPool = new Pool({
  max: 5,
  min: 1,
  user: 'express',
  password: 'bun+typescript',
  host: 'localhost',
  port: 5432,
  database: 'express_app',
})

// テーブルのデータ構造定義
interface mydataTable {
  id: number
  name: string
  email: string
  age: number
}

// フォームから送られてくるデータの定義
interface RequestUserAdd {
  name: string
  email: string
  age: number
}

interface RequestUserEdit {
  id: number
  name: string
  email: string
  age: number
}

interface RequestUserDelete {
  id: number
}

// 検索用クエリパラメータの定義
interface UserQueryParams {
  id: number
}

// mydata のフォーム値チェックルール
const mydataValidators = [
  body('name', 'NAME は必ず入力してください').notEmpty(),
  body('email', 'E-MAIL はメールアドレスを入力してください').isEmail(),
  body('age', 'AGE は0以上120以下の整数を入力してください').isInt({min: 0, max: 120}),
]

// GETアクセスの処理
router.get('/', async (req: Request, res: Response) => {
  const db = await dbPool.connect()
  try {
    const result = await db.query<mydataTable>('SELECT * FROM mydata ORDER BY id')
    const data = {
      title: 'Users!',
      content: result.rows,
    }
    res.render('mydata/index', data)
  } finally {
    db.release()
  }
})

router.get('/add', async (_req: Request, res: Response) => {
  const data = {
    title: 'Users/Add',
    content: '新しいレコードを入力',
    form: {name: '', email: '', age: ''},
  }
  res.render('mydata/add', data)
})

router.post('/add', mydataValidators, async (req: Request, res: Response) => {
  // バリデーションの結果を取り出す。
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // errors が空っぽではないということは、入力値に問題があったということ
    res.render('mydata/add', {
      title: 'Users/Add',
      content: '新しいレコードを入力',
      form: req.body,
      errors: errors.array(),
    })
    return
  }

  const {name, email, age} = matchedData<RequestUserAdd>(req)
  const db = await dbPool.connect()

  try {
    // トランザクション開始
    await db.query('BEGIN')

    // INSERT 文の実行
    await db.query('INSERT INTO mydata (name, email, age) VALUES ($1, $2, $3)',
      [name, email, age],
    )

    // コミット
    await db.query('COMMIT')
  } catch (error) {
    // トランザクションのロールバック
    await db.query('ROLLBACK')
  } finally {
    db.release()
  }
  res.redirect('/mydata')
})

router.get('/show',
  query('id').isInt({min: 1}),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.redirect('/mydata')
    }
    const {id} = matchedData<UserQueryParams>(req)

    const db = await dbPool.connect()

    try {
      const result = await db.query<mydataTable>('SELECT * FROM mydata WHERE id = $1', [id])
      res.render('mydata/show', {
        title: 'Users/show',
        content: `id = ${id} のレコード`,
        mydata: result.rows[0] || {},
      })
    } finally {
      db.release()
    }
  })

router.get('/edit', async (req: Request<{}, {}, {}, UserQueryParams>, res: Response) => {
  const id = req.query.id
  const db = await dbPool.connect()

  try {
    const result = await db.query<mydataTable>('SELECT * FROM mydata WHERE id = $1', [id])
    res.render('mydata/edit', {
      title: 'Users/edit',
      content: `id = ${id} のレコードを編集`,
      mydata: result.rows[0] || {},
    })
  } finally {
    db.release()
  }
})

router.post('/edit', mydataValidators, body('id').isInt({min: 1}),
  async (req: Request, res: Response) => {
    // バリデーションの結果を取り出す。
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // errors が空っぽではないということは、入力値に問題があったということ
      res.render('mydata/edit', {
        title: 'Users/Edit',
        content: '新しいレコードを入力',
        mydata: req.body,
        errors: errors.array(),
      })
      return
    }

    const {id, name, email, age} = matchedData<RequestUserEdit>(req)
    const db = await dbPool.connect()

    try {
      // トランザクション開始
      await db.query('BEGIN')

      // 更新処理
      await db.query(
        'UPDATE mydata SET name = $1, email = $2, age = $3 WHERE id = $4',
        [name, email, age, id],
      )

      // トランザクションコミット
      await db.query('COMMIT')

      // リダイレクト
      res.redirect('/mydata')
    } catch (error) {
      console.error(error)
      // トランザクションのロールバック
      await db.query('ROLLBACK')
    } finally {
      db.release()
    }
  })

router.get('/delete', async (req: Request<{}, {}, {}, UserQueryParams>, res: Response) => {
  const id = req.query.id
  const db = await dbPool.connect()

  try {
    const result = await db.query<mydataTable>('SELECT * FROM mydata WHERE id = $1', [id])
    res.render('mydata/delete', {
      title: 'Users/delete',
      content: `id = ${id} のレコード`,
      mydata: result.rows[0] || {},
    })
  } finally {
    db.release()
  }
})

router.post('/delete', async (req: Request<{}, {}, RequestUserDelete>, res: Response) => {
  const id = req.query.id
  const db = await dbPool.connect()

  try {
    // トランザクション開始
    await db.query('BEGIN')

    // 削除処理
    await db.query('DELETE FROM mydata WHERE id = $1', [id])

    // トランザクションコミット
    await db.query('COMMIT')

    // リダイレクト
    res.redirect('/users')
  } catch (error) {
    console.error(error)
    // トランザクションロールバック
    await db.query('ROLLBACK')
  } finally {
    db.release()
  }
})

export default router