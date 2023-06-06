const express = require('express');
const userAgent = require('express-useragent');
const mysql = require('mysql');
const rateLimit = require("express-rate-limit");
//const logSymbols = require('log-symbols');
//const chalk = require('chalk');
const mongoose = require('mongoose');
const requestIp = require('request-ip');
//const fs = require('fs');
const app = express();  

// menghubungkan ke database MongoDB
mongoose.connect('mongodb+srv://izzdevs06:kepoajaa@db.syk8gwg.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const connection = mysql.createConnection({
  host: 'bfptsai4t7folkjnub3c-mysql.services.clever-cloud.com',
  user: 'ujgli2wjahqgbdh6',
  password: 'Hl5bHIDIoyJ8bcwyRu97',
  database: 'bfptsai4t7folkjnub3c'
});
// membuat schema untuk collection "payloads"
const userSchema = new mongoose.Schema({
    device: String,
    os: String,
    browser: String,
    ip: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
// membuat model untuk collection "payloads"
const User = mongoose.model('UserInfo', userSchema);

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 100
  });

app.use(userAgent.express());
app.use(requestIp.mw());
app.use(limiter);
app.set('view engine', 'ejs');
app.use(express.static('views'));
//Home
app.get('/', (req, res) => {
    res.render('index', {title: 'Home'});
    //get info
    const device = req.useragent.device || 'Unknown';
    const os = req.useragent.os || 'Unknown';
    const browser = req.useragent.browser || 'Unknown';
    const ip = req.clientIp || 'Unknown';
    const timestamp = new Date().getTime() + (7 * 60 * 60 * 1000);
    const date = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

    const data = {
        device: device,
        os: os,
        browser: browser,
        ip: ip,
        time: date
    }
    //kirim ke database
    connection.query('INSERT INTO info SET ?', data, (error, results, fields) => {
        if (error) throw error;
        console.log(data)
        console.log('Data inserted successfully\n');
    });
    //kirim ke mongodb
    // menyimpan data user ke MongoDB database
    const userdata = new User(data);
    userdata.save()
        .then(() => console.log('User data saved to database'))
        .catch(err => console.log(err));

});

app.get('/1', (req,res) => {
    //get info
    const agent = useragent.parse(req.headers['user-agent']);
    const device = agent.device.toString();
    const os = agent.os.toString();
    const browser = agent.toAgent();
    const ip = req.socket.remoteAddress;
    const timestamp = new Date().getTime() + (7 * 60 * 60 * 1000);
    const date = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

    const data = {
        device: device,
        os: os,
        browser: browser,
        ip: ip,
        time: date
    }
    res.send(`Device: ${device}<br>OS: ${os}<br>Browser: ${browser}<br>IP Address: ${ip}<br>Timestamp: ${date} UTC+7`);
});

//Start serber
app.listen(3000, () => {
    console.log("Server v1.0");
    console.log('Server started on port 3000');
});
