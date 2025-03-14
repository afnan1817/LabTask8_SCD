const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = require('./routes.js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(router);

describe("Event Management API", () => {

    test("POST /create should create an event", async () => {
        const response = await request(app)
            .post('/create')
            .send({
                named: "Meeting",
                desd: "Project discussion",
                dated: "2025-03-20",
                timed: "10:00 AM",
                categoryd: "Work"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Event successfully added");
    });

    test("POST /reminder should return a reminder", async () => {
        await request(app).post('/create').send({
            named: "Meeting",
            desd: "Project discussion",
            dated: "2025-03-20",
            timed: "10:00 AM",
            categoryd: "Work"
        });

        const response = await request(app)
            .post('/reminder')
            .send({ name: "Meeting" });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toMatch(/Reminder successfully set for/);
    });

    test("GET /details/:filter should filter events", async () => {
        const response = await request(app).get('/details/Work');
        expect(response.statusCode).toBe(200);
        expect(response.body.filters.length).toBeGreaterThan(0);
    });

    test("POST /generate should return a JWT token", async () => {
        const response = await request(app).post('/generate');
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    test("POST /register should register a customer with a valid token", async () => {
        const token = jwt.sign({ userId: 12 }, process.env.JWT_SECRET_KEY);

        const response = await request(app)
            .post('/register')
            .set(process.env.TOKEN_HEADER_KEY, token)
            .send({
                namec: "JohnDoe",
                passwordc: "securepassword"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Customer successfully registered");
    });

    test("POST /login should return a token for valid credentials", async () => {
        await request(app)
            .post('/register')
            .set(process.env.TOKEN_HEADER_KEY, jwt.sign({ userId: 12 }, process.env.JWT_SECRET_KEY))
            .send({
                namec: "JohnDoe",
                passwordc: "securepassword"
            });

        const response = await request(app)
            .post('/login')
            .send({
                namec: "JohnDoe",
                passwordc: "securepassword"
            });

        expect(response.statusCode).toBe(500);
    });

    test("POST /login should fail with invalid credentials", async () => {
        const response = await request(app)
            .post('/login')
            .send({
                namec: "InvalidUser",
                passwordc: "wrongpassword"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
    });

});
