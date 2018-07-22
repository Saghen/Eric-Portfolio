'use strict'

const express = require('express')
    , app = express()
    , formidable = require('express-formidable')
    , compression = require('compression')
    , fs = require("fs")
    , greenlock = require('greenlock-express')
    , cookieParser = require('cookie-parser')
    , RateLimit = require('express-rate-limit');

app.use(function (req, res, next) {
    if (!req.secure) {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
});

app.use(compression());
app.use(express.static("public"));
app.use(formidable());
app.use(cookieParser());

app.use('/blog', require(__dirname + '/routes/blog.js'));
app.use('/api/auth', require(__dirname + '/routes/api/api-login.js'));
app.use('/api/blog', require(__dirname + '/routes/api/api-blog.js'));

var apiLimiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2,
    delayMs: 0
});

//app.use('/api/blog/addComment', apiLimiter); //Limit the speed of adding comments

app.post('/blog/fileupload', function (req, res) {
    let oldPath = req.files.image.path;
    let newPath = __dirname + "/public/imgs/" + req.files.image.name;
    fs.rename(oldPath, newPath, function(err) {
        res.send(err.code);
    });
    res.send("Success!")
})


// Start the server
greenlock.create({
    version: 'draft-11'
    , server: 'https://acme-v02.api.letsencrypt.org/directory'
    , configDir: '~/.config/acme/'
    , email: 'saghendev@gmail.com'
    , approveDomains: ['saghen.com']
    , agreeTos: true
    , app: app
    , communityMember: false
    , telemetry: false
}).listen(8080, 8081);