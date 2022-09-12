import express from 'express'
import { hash, prisma, getTokens, nanoid, extractToken, checkAuthorized, getUserIdByBearerToken, storeDir } from '../index'
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'

const router = express.Router()

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, storeDir)
    }
});

const upload = multer({ storage })

const getFileById = async (id) => {
    const file = await prisma.file.findUnique({
        where: { id: Number(id) }
    })
    return file
}

const deleteFile = async (name) => {

    fs.unlink(path.join(storeDir, name))
}

router.post('/upload', upload.single('fileData'), async (req, res) => {

    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) {
            req.file ? fs.unlink(path.join(storeDir, req.file.filename)) : 1
            res.sendStatus(401)
            return
        }
        const { file } = req
        if (file) {
            const userId = await getUserIdByBearerToken(req, res)

            const fileData = await prisma.file.create({
                data: {
                    originalName: file.originalname,
                    name: file.filename,
                    extension: file.originalname.split('.').slice(-1).toString(),
                    size: String(file.size),
                    uploadedAt: String(Date.now()),
                    mimetype: file.mimetype,
                    userId
                }
            })
            res.status(200).json(fileData);
        }
        else {
            res.sendStatus(400)
            return
        }
    } catch (err: any) {
        console.error(err)
        res.sendStatus(500)
        return
    }
});

router.get('/list', async (req, res) => {
    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) return res.sendStatus(401)
        let page = Number(req.query.page)
        let list_size = Number(req.query.list_size)
        if (!list_size) list_size = 10
        if (!page) page = 1

        const files = await prisma.file.findMany({
            skip: list_size * (page - 1),
            take: list_size
        })

        res.json(files)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) return res.sendStatus(401)
        const { id } = req.params
        const file = await getFileById(id)
        if (!file) {
            res.sendStatus(404)
            return
        }
        res.json(file)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }

})



router.get('/download/:id', async (req, res) => {
    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) return res.sendStatus(401)
        const { id } = req.params
        const file: any = await getFileById(id)
        if (!file) {
            res.sendStatus(404)
            return
        }
        res.download(path.join(storeDir, file.name), file.originalName)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) {
            return res.sendStatus(401)
        }
        const { id } = req.params

        if (!id) {
            return res.sendStatus(400)
        }

        const file = await prisma.file.findUnique({
            where: { id: Number(id) }

        })

        if (!file) {
            res.sendStatus(404)
            return
        }

        await prisma.file.delete({
            where: { id: file.id }
        })

        deleteFile(file.name)
        res.json(file)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.put('/update/:id', upload.single('fileData'), async (req, res) => {
    try {
        const isAuthorized = await checkAuthorized(req, res)
        if (!isAuthorized) {
            req.file ? fs.unlink(path.join(storeDir, req.file.filename)) : 1
            res.sendStatus(401)
            return
        }
        const { id } = req.params
        const file: any = req.file
        if (!file) {
            res.sendStatus(400)
            return
        }
        const oldFile: any = await getFileById(id)
        if (!oldFile) {
            res.sendStatus(404)
            return
        }
        const newFile = await prisma.file.update({
            where: { id: Number(id) },
            data: {
                originalName: file.originalname,
                name: file.filename,
                extension: file.originalname.split('.').slice(-1).toString(),
                size: String(file.size),
                uploadedAt: String(Date.now()),
                mimetype: file.mimetype,
            }
        })

        if (newFile) {
            deleteFile(oldFile.name)
            res.json(newFile)
        } else {
            res.sendStatus(404)
            return
        }

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

export default router 