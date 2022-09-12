import express from 'express'
import { hash, prisma, getTokens, nanoid, extractToken } from '../index'
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        let { id, password } = req.body;

        if (!id || !password) {
            res.sendStatus(400)
            return
        }
        password = hash(password);
        const user = await prisma.user.findUnique({
            where: { id: String(id) },
        });

        if (!user) {
            res.sendStatus(404);
            return;
        }

        if (password !== user.password) {
            res.sendStatus(400);
            return;
        }

        const tokens = await getTokens(user.id)
        res.status(200).json(tokens)
    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
});

router.post('/new_token', async (req, res) => {
    try {
        const refreshToken = extractToken(req, res, 'Refresh')
        if (!refreshToken) {
            res.sendStatus(401)
            return
        } else {
            const bearerToken = nanoid()
            let tokens: any = null
            try {
                tokens = await prisma.token.update({
                    where: { refreshToken },
                    data: {
                        bearerToken,
                        touchedAt: String(Date.now())
                    }
                })
            } catch {
                res.sendStatus(401)
                return
            }


            if (tokens) {
                res.json(tokens)
            } else {
                res.sendStatus(404)
            }
        }


    } catch (err) {
        console.error(err)
        res.sendStatus(500)

    }
})


export default router