import express from 'express'
import { hash, prisma, getTokens } from '../index'

const router = express.Router()

const deleteBearerToken = async () => {
    const tokens = await prisma.token.findMany()
    tokens.forEach(item => {
        (async () => {
            if (Date.now() - Number(item.touchedAt) > 1000 * 60 * 10) {
                await prisma.token.update({
                    where: {
                        refreshToken: item.refreshToken
                    },
                    data: {
                        bearerToken: null
                    }
                })
            }
        })()
    })
}

setInterval(() => deleteBearerToken(), 1000 * 60)

router.post('/', async (req, res) => {
    try {
        let { id, password } = req.body;

        if (!id || !password) {
            res.sendStatus(400);
            return;
        }

        password = hash(password);

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (user) {
            res.status(409).send('User with this login is already exists');
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                id: String(id),
                password: String(password),
            },
        });

        const tokens = await getTokens(newUser.id)

        res.json(tokens);
    } catch (err: any) {
        console.error(err)
        res.sendStatus(500);
    }
});


export default router