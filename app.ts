import type {NextFunction, Request, Response} from 'express'
import express from 'express'
import debugModule from 'debug'
import path from 'node:path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import createError, {HttpError} from 'http-errors'

import indexRouter from './routes/index'
import postsRouter from './routes/posts'
import {cdate} from 'cdate'

const app = express()

const debug = debugModule('app:server')

// Application settings
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
  },
}))

// Pug で使う日時のフォーマット関数
app.locals.dateFormat = (dt:Date) => cdate(dt)
  .tz('Asia/Tokyo')
  .format('YYYY-MM-DD HH:mm:ss')

// register routes
app.use('/', indexRouter)
app.use('/posts', postsRouter)

// catch 404 and forward to error handler
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404))
})

// error handler
app.use(async (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let status = 500
  if (err instanceof HttpError) {
    status = err.status || 500
    res.locals.title = `${status}: ${err.message}`
    res.locals.error = req.app.get('env') === 'development' && status >= 500 ? err : {}
  }

  res.status(status)
  res.render('error')
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  debug(`Listening on port ${port}`)
})