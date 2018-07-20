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

    router.post('/insert', function (req, res) {
        let blogData = require(path.resolve(__mainDir, 'database/blog-info.json'));
        let data = req.fields;
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        data.dateposted = `${months[new Date(Date.now()).getMonth()]} ${new Date(Date.now()).getDate()}, ${new Date(Date.now()).getFullYear()}`
        data.id = blogData.length;
        blogData.unshift(data);
        fs.writeFile(path.resolve(__mainDir, 'database/blog-info.json'), JSON.stringify(blogData), (err) => {
            if(!err) return res.json({success: true});
            console.error('Error occured while writing out new blog post data while inserting data. Check routes/api/api-blog.js');
            console.error(err);
            return res.status(500).json({success: false});
        })
    });

    router.post('/upload', function (req, res) {
        if (!req.files.image) { return res.status(400).send('No file was selected'); }

        fs.copyFile(req.files.image.path, path.resolve(__mainDir, 'public/uploads/', req.files.image.name), (err) => {
            if (err) return res.send('An error occured. ' + JSON.stringify(err));
            fs.unlink(req.files.image.path, err => console.log(err));
            res.send('File can be found at https://saghen.com/uploads/' + req.files.image.name);
        });
    })

    router.get('/data', function (req, res) {
        if (req.query.id) return res.json(require(path.resolve(__mainDir, 'database/blog-info.json'))[req.query.id])
        res.sendFile(path.resolve(__mainDir, 'database/blog-info.json'));
    })

    router.get('/authorInfo', (req, res) => {
        if (!req.query.author) return res.status(400).send();
        let data = require(path.resolve(__mainDir, 'database/author-info.json'))
        res.json(data[req.query.author]);
    })

    router.post('/addComment', (req, res) => {
        if (!req.query.id || !req.fields.author || !req.fields.content) res.status(400).json({ reason: 'No id sent in query string or the author or content was missing in the body.', success: false });
        let blogData = require(path.resolve(__mainDir, 'database/blog-info.json'));

        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let currentDate = `${months[new Date(Date.now()).getMonth()]} ${new Date(Date.now()).getDate()}, ${new Date(Date.now()).getFullYear()}`

        blogData[req.query.id].comments.push({ author: req.fields.author, content: req.fields.content, date: currentDate });

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

        blogData[req.query.id].comments.splice(req.query.commentId, 1);

        fs.writeFile(path.resolve(__mainDir, 'database/blog-info.json'), JSON.stringify(blogData), (err) => {
            if (!err) return res.json({ success: true });
            console.error('Error occured while writing out new blog post data while inserting data. Check routes/api/api-blog.js');
            console.error(err);
            return res.status(500).json({ success: false });
        });
    })

    return router;
})();