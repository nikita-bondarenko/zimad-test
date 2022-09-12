import request from 'supertest';
import { app, hash, nanoid } from '../../src/index';
import fs from 'fs/promises';
import path from 'path';


let created: any = null
const file = path.join(__dirname, '..', 'files', 'resume.pdf');
const secondFile = path.join(__dirname, '..', 'files', 'image.jpg');
const downloadsPath = path.join(__dirname, '..', 'downloads');

const id = String(Date.now());
let password = String(Date.now());
let checked = null
let bearerToken = null
let refreshToken = null
let fileData: any = null
let fileId = null

const userClient = {
    id,
    password,
};
password = hash(password);
const userServer = { ...userClient, password }

describe('POST /signup', () => {
    it('should return error 400', async () => {
        await request(app).post('/signup').send({}).expect(400);
        await request(app).post('/signup').send({ id: nanoid() }).expect(400);
        await request(app).post('/signup').send({ password: nanoid() }).expect(400);
    });

    it('should create user and return tokens with status 200', async () => {
        created = await request(app).post('/signup').send(userClient).expect(200);
        if (created && created.body) {
            refreshToken = created.body.refreshToken
        }
    });

    it('should return error 409', async () => {
        if (created) {
            await request(app).post('/signup').send(userClient).expect(409);
        }
    });
})



describe('POST /signin', () => {
    it('should response with status 404', async () => {
        if (created) {
            await request(app).post('/signin').send({ id: nanoid(), password: nanoid() }).expect(404)
        }
    })

    it('should response with status 400', async () => {
        if (created) {
            await request(app).post('/signin').send(userServer).expect(400)
            await request(app).post('/signin').send({ id: 'asd' }).expect(400)
            await request(app).post('/signin').send({ password: 'asd' }).expect(400)
        }
    })

    it('should response with 200', async () => {
        if (created) {
            await request(app).post('/signin').send(userClient).expect(200)
        }
    })
})

describe('POST /signin/new_token', () => {
    it('should return tokens and response with 200', async () => {
        const res = await request(app).post('/signin/new_token').set('Authorization', `Refresh ${refreshToken}`).set('Application', 'multipart/form-data').expect(200)
        bearerToken = res.body.bearerToken
    })
})

describe('GET /info', () => {
    it('should response with 401', async () => {
        await request(app).get('/info').set('Authorization', `Refresh ${bearerToken}`).expect(401)
        await request(app).get('/info').set('Authorization', `Bearer ${Date.now()}`).expect(401)
        await request(app).get('/info').expect(401)
    })
    it('should return id and response with 200', async () => {
        await request(app).get('/info').set('Authorization', `Bearer ${bearerToken}`).expect(200, { userId: id })
    })
})

describe('POST /file/upload', () => {
    it('should response with 401', async () => {
        if (bearerToken) {
            await request(app).post('/file/upload').set('Authorization', `Bearer bad-token`).attach('fileData', file).expect(401)
            await request(app).post('/file/upload').expect(401)
            await request(app).post('/file/upload').set('Authorization', `Refresh ${bearerToken}`).attach('fileData', file).expect(401)
        }
    })
    it('should response with 400', async () => {
        if (bearerToken) {
            await request(app).post('/file/upload').set('Authorization', `Bearer ${bearerToken}`).expect(400)

        }
    })
    it('should response with 500', async () => {
        if (bearerToken) {
            await request(app).post('/file/upload').set('Authorization', `Bearer ${bearerToken}`).attach('bad-name', file).expect(500)
        }
    })
    it('should response with 200', async () => {
        if (bearerToken) {
            const res = await request(app).post('/file/upload').set('Authorization', `Bearer ${bearerToken}`).attach('fileData', file).expect(200)
            fileId = res.body.id
        }
    })
})

describe('PUT /file/update/:id', () => {
    it('should response with 401', async () => {
        if (fileId) {
            await request(app).put(`/file/update/${fileId}`).set('Authorization', `Bearer bad-token`).attach('fileData', file).expect(401)
            await request(app).put(`/file/update/${fileId}`).expect(401)
            await request(app).put(`/file/update/${fileId}`).set('Authorization', `Refresh ${bearerToken}`).attach('fileData', file).expect(401)
        }
    })
    it('should response with 400', async () => {
        if (fileId) {
            await request(app).put(`/file/update/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).expect(400)

        }
    })
    it('should response with 500', async () => {
        if (fileId) {
            await request(app).put(`/file/update/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).attach('bad-name', file).expect(500)
        }
    })
    it("should return fileData with 200", async () => {

        if (fileId) {
            const res = await request(app).put(`/file/update/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).attach('fileData', secondFile).expect(200)
            fileData = res.body
        }

    })
})

describe('GET /file/download/:id', () => {
    it('should response with 401', async () => {
        await request(app).get(`/file/download/${fileId}`).set('Authorization', `Refresh ${bearerToken}`).expect(401)
        await request(app).get(`/file/download/${fileId}`).set('Authorization', `Bearer ${Date.now()}`).expect(401)
        await request(app).get(`/file/download/${fileId}`).expect(401)
    })
    it("should response with 404", async () => {
        if (fileData) {
            await request(app).get(`/file/download/${Date.now()}`).set('Authorization', `Bearer ${bearerToken}`).expect(404)
        }
    })
    it("should download image/jpeg with 200", async () => {
        if (fileData) {
            const res = await request(app).get(`/file/download/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).expect(200)
            fs.writeFile(path.join(downloadsPath, fileData.originalName), res.body)
            expect(res.headers["content-type"]).toEqual("application/octet-stream")
        }
    })
})

describe("GET /file/:id", () => {
    it('should response with 401', async () => {
        await request(app).get(`/file/${fileId}`).set('Authorization', `Refresh ${bearerToken}`).expect(401)
        await request(app).get(`/file/${fileId}`).set('Authorization', `Bearer ${Date.now()}`).expect(401)
        await request(app).get(`/file/${fileId}`).expect(401)
    })
    it("should response with 404", async () => {
        if (fileData) {
            await request(app).get(`/file/${Date.now()}`).set('Authorization', `Bearer ${bearerToken}`).expect(404)
        }
    })
    it('should return fileData with 200', async () => {
        if (fileData) {
            await request(app).get(`/file/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).expect(200, fileData)
        }
    })

})

describe("GET /file/list", () => {
    it('should response with 401', async () => {
        await request(app).get(`/file/list`).set('Authorization', `Refresh ${bearerToken}`).expect(401)
        await request(app).get(`/file/list`).set('Authorization', `Bearer ${Date.now()}`).expect(401)
        await request(app).get(`/file/list`).expect(401)
    })
    it("should return list with 200", async () => {
        if (fileData) {
            await request(app).get(`/file/list`).set('Authorization', `Bearer ${bearerToken}`).expect(200)
        }
        if (fileData) {
            await request(app).get(`/file/list`).query({ list_size: 4, page: 2 }).set('Authorization', `Bearer ${bearerToken}`).expect(200)
        }
        if (fileData) {
            await request(app).get(`/file/list`).query({ list_size: 5, page: 1 }).set('Authorization', `Bearer ${bearerToken}`).expect(200)
        }
        if (fileData) {
            await request(app).get(`/file/list`).query({ list_size: 5, page: Date.now() }).set('Authorization', `Bearer ${bearerToken}`).expect(200)
        }
    })
})

describe("DELETE /file/delete/:id", () => {
    it('should response with 401', async () => {
        if (fileData) {

            await request(app).delete(`/file/delete/${fileId}`).set('Authorization', `Refresh ${bearerToken}`).expect(401)
            await request(app).delete(`/file/delete/${fileId}`).set('Authorization', `Bearer ${Date.now()}`).expect(401)
            await request(app).delete(`/file/delete/${fileId}`).expect(401)
        }
    })
    it("should response with 404", async () => {
        if (fileData) {
            await request(app).delete(`/file/delete/${Date.now()}`).set('Authorization', `Bearer ${bearerToken}`).expect(404)
        }
    })
    it('should response with 200', async () => {
        if (fileData) {
            await request(app).delete(`/file/delete/${fileId}`).set('Authorization', `Bearer ${bearerToken}`).expect(200, fileData)
        }
    })
})

let logouted: any = null

describe("GET /logout", () => {
    it("should return tokens which are not equal to old one with 200", async () => {
        if (fileData) {
            logouted = await request(app).get('/logout').set('Authorization', `Bearer ${bearerToken}`).expect(200)
            expect(logouted.body.bearerToken).not.toBe(bearerToken)
            expect(logouted.body.refreshToken).not.toBe(refreshToken)
            bearerToken = logouted.body.bearerToken
            refreshToken = logouted.body.refreshToken
        }
    })
    it('should response with 401', async () => {
        if (logouted) {
            await request(app).post('/signin/new_token').set('Authorization', `Refresh ${refreshToken}`).expect(401)
            await request(app).get('/info').set('Authorization', `Bearer ${bearerToken}`).expect(401)

        }
    })
})

describe('DELETE /user/:id', () => {
    it('should return user and response with 200', async () => {
        if (logouted) {
            await request(app).delete(`/user/${id}`).expect(200, userServer);
        }
    })
})
