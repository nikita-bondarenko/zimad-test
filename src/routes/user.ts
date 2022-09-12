import express from 'express'
import { hash, prisma } from '../index'

const router = express.Router()

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.delete({
            where: { id },
        });

        res.json(user);
    } catch (err) {
        res.sendStatus(500);
    }
});

export default router