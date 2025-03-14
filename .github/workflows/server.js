const express = require('express');
const app = express();
const port = process.env.PORT || 3003;
const Routes = require('./routes.js');
app.get('/', (req, res) => {
res.send('Hello from the Microservice!');
});
app.use('/events',Routes);
app.listen(port, () => {
console.log(`Microservice listening on port ${port}`);
});