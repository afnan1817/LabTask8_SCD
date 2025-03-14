const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const events = [];
const customers = [];

router.post('/create', (req, res) => {
    try {
        const { named, desd, dated, timed, categoryd } = req.body;
        const event = { name: named, des: desd, date: dated, time: timed, category: categoryd };
        events.push(event);
        res.json({ message: "Event successfully added" });
    } catch (error) {
        res.json({ message: `Error: ${error.message}` });
    }
});

router.post('/reminder', (req, res) => {
    try {
        const { name } = req.body;
        const event = events.find(e => e.name === name);
        if (!event) return res.status(404).json({ message: "Event not found" });

        res.json({ message: `Reminder successfully set for ${event.date}, ${event.time}` });
    } catch (error) {
        res.json({ message: `Error: ${error.message}` });
    }
});

router.get('/details/:filter', (req, res) => {
    try {
        const filter = req.params.filter;
        const filters = events.filter(event => event.category === filter || event.date === filter || event.time === filter);
        res.json({ filters });
    } catch (error) {
        res.json({ message: `Error: ${error.message}` });
    }
});

router.post("/generate", (req, res) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = { time: Date(), userId: 12 };
    const token = jwt.sign(data, jwtSecretKey);
    res.send(token);
});

router.post('/register', (req, res) => {
    try {
        const { namec, passwordc } = req.body;
        let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (!verified) {
            return res.status(401).json({ message: "Request denied" });
        }

        const customer = { name: namec, password: passwordc };
        customers.push(customer);
        res.json({ message: "Customer successfully registered" });
    } catch (error) {
        res.json({ message: `Error: ${error.message}` });
    }
});

router.post('/login', (req, res) => {
    const { namec, passwordc } = req.body;
    const customer = customers.find(u => u.name === namec);
    if (customer && customer.password === passwordc) {
        const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
