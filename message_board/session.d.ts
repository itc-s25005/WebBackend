import type {User} from './generated/prisma/client'

declare module 'express-session' {
  interface SessionData {
    login: User | null
    back: string
  }
}