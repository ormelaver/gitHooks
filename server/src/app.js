const express = require('express');
const eventHandler = require('./eventHandler');

const app = express();
app.use(express.json());

app.post('/events', (req,res) => {
    eventHandler.initVerification(req);
    
});

module.exports = app;