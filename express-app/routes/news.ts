import {type Request, type Response, Router} from 'express'
import axios from 'axios'
import {XMLParser} from 'fast-xml-parser'

const router = Router()

const xmlParser = new XMLParser()
const httpClient = axios.create({
  baseURL: 'https://news.google.com',
  transformResponse: [
    data => xmlParser.parse(data),
  ],
})

router.get('/', async (_req: Request, res: Response) => {
  const googleNews = (await httpClient.get('/rss?hl=ja&gl=JP&ceid=JP:ja')).data
  const data = {
    title: 'Google News',
    content: googleNews.rss.channel.item,
  }
  res.render('news', data)
})

export default router