const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require("mongodb-memory-server");

async function cleanDB() {
    const collections = mongoose.connection.collections

    for (const key in collections) {
        await collections[key].deleteMany()
    }
}

let mongoServer
 
describe('POST /api/v1/autenticazione', () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        mongoServer = await MongoMemoryServer.create();
        app.locals.db = await mongoose.connect(mongoServer.getUri())
        await request(app).post('/api/v1/registrazione').send({
            username: "test",
            password: "test",
            email: "test@test"
        });
    })

    afterAll(async () => {
        await cleanDB();
        await mongoose.connection.close();
        await mongoServer.stop();
        console.log("CONN", mongoose.connection.readyState);
        console.log("MONGO CONN", mongoServer.state);

    })

    test("Login con account non registrato", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "UsernameNonRegistrato",
            password: "PasswordNonRegistrata",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login con password sbagliata", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "test",
            password: "PasswordNonRegistrata",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login con campo username vuoto", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "",
            password: "PasswordNonRegistrata",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login utilizzando un account registrato", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "test",
            password: "test",
        }).expect(201).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Enjoy your token!',token: /(.*)/, email: /(.*)/, id: /(.*)/,self: /\/api\/v1\/utenti\/(.*)/ })
    })
 });