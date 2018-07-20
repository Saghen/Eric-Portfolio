'use strict';

let path = require('path')
    , bcrypt = require('bcrypt')
    , crypto = require('crypto')
    , fs = require('fs');

module.exports = (function () {
    var router = require('express').Router();

    let __mainDir = path.dirname(require.main.filename);

    function isLoggedIn(req) {
        let accounts = require(path.resolve(__mainDir, 'database/accounts.json'));
        let account = accounts.find((element) => { if (element.username == req.cookies.username) { return true; } });

        if (account === undefined) {
            return false;
        }

        return account.token == req.cookies.token;
    }

    router.get('/login', function (req, res) {
        let accounts = require(path.resolve(__mainDir, 'database/accounts.json'));
        let id = accounts.find((element) => { if (element.username == req.query.username) { return true; } }).id;
        if (id === undefined) {
            res.status(400).send('Username was not found');
            return;
        }
        if (req.query.password === undefined) {
            res.status(400).send('Please provide a password');
            return;
        }
        bcrypt.hash(req.query.password, accounts[id].salt, (err, hash) => {
            if (accounts[id].hash != hash) {
                res.status(403).send('Password is incorrect');
                return;
            }
            let token = crypto.randomBytes(32).toString('hex');
            accounts[id].token = token;
            res.cookie('token', token, { secure: true, maxAge: 5184000000, path: '/' }); //Expires after 60 days
            res.cookie('username', req.query.username, { secure: true, path: '/' });
            res.redirect('https://' + req.hostname + '/blog/insert');
            fs.writeFile(path.resolve(__mainDir, 'database/accounts.json'), JSON.stringify(accounts), (err) => { if (err) console.log(err); });
        })
    });
    
    router.get('/logout', function (req, res) {
        let accounts = require(path.resolve(__mainDir, 'database/accounts.json'));
        for (let account of accounts) {
            if (account.token == req.cookies.token) account.token = "";
            break;
        }
        fs.writeFile(path.resolve(__mainDir, 'database/accounts.json'), JSON.stringify(accounts), (err) => { if (err) console.log(err); });
        res.cookie('token', '', { secure: true });
        res.cookie('username', '', { secure: true });
        res.send('Success');
    });

    router.get('/isLoggedIn', (req, res) => {
        if (isLoggedIn(req)) return res.json({ success: true });
        return res.json({ success: false });
    });

    return router;
})();