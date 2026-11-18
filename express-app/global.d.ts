declare global {
  declare module 'express-session' {
    interface SessionData {
      message?: string
    }
  }
}