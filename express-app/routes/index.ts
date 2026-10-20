import {Router, type Request, type Response, type NextFunction} from 'express'

const router = Router()

/* GET home page. */
router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  res.render('index', { title: 'Express'})
})

export default router