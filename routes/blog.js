'use strict';

let path = require('path')
    , fs = require('fs');

module.exports = (function () {
    var router = require('express').Router();

    let __mainDir = path.dirname(require.main.filename);

    router.get('/', function (req, res) {
        return res.sendFile(path.resolve(__mainDir, 'views/blog/home.html'));
    });

    router.get('/post', function (req, res) {
        return res.sendFile(path.resolve(__mainDir, 'views/blog/post.html'));
    });

    router.get('/insert', function (req, res) {
        let accounts = require(path.resolve(__mainDir, 'database/accounts.json'));

        if (!req.cookies.username || !req.cookies.token) { return res.redirect('https://' + req.hostname + '/blog/login'); }

        if(!accounts.find((element) => { if (element.username == req.cookies.username || element.token == req.cookies.token) { return true; } })) {
            return res.status(403).json({ reason: "User's credentials have expired."});
        }

        return res.sendFile(path.resolve(__mainDir, 'views/blog/insert.html'));
    });

    router.get('/login', function(req, res) {
        let accounts = require(path.resolve(__mainDir, 'database/accounts.json'));

        if (!req.cookies.username || !req.cookies.token) { return res.sendFile(path.resolve(__mainDir, 'views/blog/login.html')); }

        if (!accounts.find((element) => { if (element.username == req.cookies.username || element.token == req.cookies.token) { return true; } })) {
            return res.sendFile(path.resolve(__mainDir, 'views/blog/login.html'));
        }

        return res.send('Already logged in.');
    })

    return router;
})();