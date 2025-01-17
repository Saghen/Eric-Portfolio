'use strict';

let path = require('path')
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

    router.post('/insertPost', function (req, res) {
        let blogData = require(path.resolve(__mainDir, 'database/blog-info.json'));
        let data = JSON.parse(JSON.stringify(req.fields));
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        data.dateposted = `${months[new Date(Date.now()).getMonth()]} ${new Date(Date.now()).getDate()}, ${new Date(Date.now()).getFullYear()}`
        data.id = Math.max.apply(Math, blogData.map(function (o) { return o.id; })) + 1;
        blogData.unshift(data);
        return fs.writeFile(path.resolve(__mainDir, 'database/blog-info.json'), JSON.stringify(blogData), (err) => {
            if (!err) return res.json({ success: true });
            console.error('Error occured while writing out new blog post data while inserting data. Check routes/api/api-blog.js');
            console.error(err);
            return res.status(500).json({ success: false });
        })
    });

    router.post('/insertFile', function (req, res) {
        if (!req.files.file) { return res.status(400).json({ message: 'No file was sent.' }); }
        if (!isLoggedIn(req)) { return res.status(403).json({ message: `Not logged in. Please go <a href="https://${req.hostname}/blog/login">here</a> to login.` }) }

        let file = req.files.file;

        fs.copyFile(file.path, path.resolve(__mainDir, 'public/uploads/', file.name), (err) => {
            if (err) return res.json({ message: 'An error occured. ' + JSON.stringify(err) });
            fs.unlink(file.path, err => { if (err) console.log(err) });
            res.status(200).json({ message: `File can be found at <a href="https://${req.hostname}/uploads/${file.name}">https://${req.hostname}/uploads/${file.name}` });
        });
    })

    router.get('/data', function (req, res) {
        if (req.query.id) {
            return res.json(require(path.resolve(__mainDir, 'database/blog-info.json')).find((elem) => { return elem.id == req.query.id }))
        }
        let data = JSON.parse(JSON.stringify(require(path.resolve(__mainDir, 'database/blog-info.json'))));
        for (let post of data) {
            delete post['content'];
        }
        return res.json(data);
    })

    router.get('/authorInfo', (req, res) => {
        if (!req.query.author) return res.status(400).send();
        let data = require(path.resolve(__mainDir, 'database/author-info.json'))
        res.json(data[req.query.author]);
    })

    let apiLimiter = new require('express-rate-limit')({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 2,
        delayMs: 0
    });

    router.post('/addComment', apiLimiter, (req, res) => {
        if (!req.query.id || !req.fields.author || !req.fields.content) res.status(400).json({ reason: 'No id sent in query string or the author or content was missing in the body.', success: false });
        let blogData = require(path.resolve(__mainDir, 'database/blog-info.json'));

        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let currentDate = `${months[new Date(Date.now()).getMonth()]} ${new Date(Date.now()).getDate()}, ${new Date(Date.now()).getFullYear()}`

        blogData.find((elem) => { return elem.id == req.query.id }).comments.push({ author: req.fields.author, content: req.fields.content, date: currentDate });

        fs.writeFile(path.resolve(__mainDir, 'database/blog-info.json'), JSON.stringify(blogData), (err) => {
            if (!err) return res.json({ success: true });
            console.error('Error occured while writing out new blog post data while inserting data. Check routes/api/api-blog.js');
            console.error(err);
            return res.status(500).json({ success: false });
        })
    });

    router.get('/removeComment', (req, res) => {
        if (!isLoggedIn(req)) return res.status(403).json({ success: false });
        if (!req.query.id || !req.query.commentId) return res.status(400).json({ success: false });

        let blogData = require(path.resolve(__mainDir, 'database/blog-info.json'));

        blogData.find((elem) => { return elem.id == req.query.id }).comments.splice(req.query.commentId, 1);

        fs.writeFile(path.resolve(__mainDir, 'database/blog-info.json'), JSON.stringify(blogData), (err) => {
            if (!err) return res.json({ success: true });
            console.error('Error occured while writing out new blog post data while inserting data. Check routes/api/api-blog.js');
            console.error(err);
            return res.status(500).json({ success: false });
        });
    })

    return router;
})();