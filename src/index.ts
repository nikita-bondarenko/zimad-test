require('dotenv').config();

import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
// const useFiles = require('./routes/file');
import signup from './routes/signup'
import signin from './routes/signin'
import user from './routes/user'
import file from './routes/file'


const port = process.env.PORT;
const staticDir = path.join(__dirname, '..', 'client');
export const storeDir = path.join(__dirname, 'store');

export const app = express();
export const prisma = new PrismaClient();
export const hash = (p) => crypto.createHash('sha512').update(p).digest('hex');
export const nanoid = () => hash(String(Date.now()))
export const getTokens = async (userId) => {
  const refreshToken: string = String(nanoid())
  const bearerToken: string = String(Date.now())
  const data = { refreshToken, bearerToken, touchedAt: String(Date.now()), userId }

  const token = await prisma.token.create({
    data
  })

  return token
}

export const extractToken = (req, res, token) => {

  try {
    const { authorization } = req.headers

    const [tokenType, refreshToken] = authorization.split(" ")
    if (!authorization || !authorization.includes(token) || !refreshToken || tokenType !== token) {
      return false
    }

    return refreshToken
  } catch {
    return false
  }
}

export const checkAuthorized = async (req, res) => {
  const bearerToken: string = extractToken(req, res, "Bearer")
  if (!bearerToken) return false
  const token = await prisma.token.findUnique({
    where: { bearerToken }
  })
  return token ? true : false
}

export const getUserIdByBearerToken = async (req, res) => {
  const bearerToken = extractToken(req, res, "Bearer")
  if (!bearerToken) return

  const token = await prisma.token.findUnique({
    where: { bearerToken },
    include: { user: true }
  })

  return token?.user?.id
}
app.use(cors());
app.use(express.static(staticDir));
app.use(express.json());
app.use('/signup', signup)
app.use('/signin', signin)
app.use('/user', user)
app.use('/file', file)

app.get('/info', async (req, res) => {
  try {
    const isAuthorized = await checkAuthorized(req, res)
    if (!isAuthorized) return res.sendStatus(401)
    const userId = await getUserIdByBearerToken(req, res)
    res.json({ userId })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/logout', async (req, res) => {
  try {
    const isAuthorized = checkAuthorized(req, res)
    if (!isAuthorized) return res.sendStatus(401)
    const bearerToken = extractToken(req, res, "Bearer")
    if (!bearerToken) return
    await prisma.token.delete({
      where: {
        bearerToken
      }
    })
    res.json({ bearerToken: nanoid(), refreshToken: nanoid() })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.listen(port, () => {
  console.log(` Listen to server at: http://localhost:${port}`);
});
