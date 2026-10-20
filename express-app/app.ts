import express, {type Request, type Response, type NextFunction} from 'express'

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express!')
})

app.listen(3000, () => {
  console.log('Start server port:3000')
})