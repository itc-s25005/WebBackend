import {prisma} from "../libs/prisma"
import argon2 from 'argon2'

// Argon2id のパラメータ
const argon2Options: argon2.HashOptions = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

// User の初期(ダミー)データ
const dummyUser = [
  {email: 'taro@example.com', password: 'yamada', name: 'Taro'},
  {email: 'hanako@example.com', password: 'flower', name: 'Hanako'},
  {email: 'sachiko@example.com', password: 'happy', name: 'Sachiko'},
  {email: 'jiro@example.com', password: 'change', name: 'Jiro'},
  {email: 'mami@example.com', password: 'mumemo', name: 'Mami'},
  {email: 'ichiro@example.com', password: 'baseball', name: 'Ichiro'},
  {email: 'kumi@example.com', password: 'co', name: 'Kumi'},
]

// Post の初期(ダミー)データ
const dummyPost = [
  {user: 1, message: 'Hello!'},
  {user: 2, message: 'こんにちは！ 試しに書いてみますね。'},
]

async function main() {
  for (const user of dummyUser) {
    await prisma.user.create({
      data: {
        email: user.email,
        password: await argon2.hash(user.password, argon2Options),
        name: user.name,
      },
    })
  }
  for (const post of dummyPost) {
    await prisma.post.create({
      data: {
        authorId: post.user,
        message: post.message,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$connect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$connect()
    process.exit(1)
  })