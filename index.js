'use strict'

const express = require('express')
    , app = express()
    , spdy = require('spdy')
    , path = require('path')
    , formidable = require('express-formidable')
    , fs = require("fs");

app.use(function (req, res, next) {
    if (!req.secure) {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
});

app.use(express.static("public"));

app.use(formidable());

app.get('/blog/post', function (req, res) {
    res.sendFile(__dirname + "/public/blog/post.html");
});

app.get('/blog/getdata', function (req, res) {
    fs.readFile(__dirname + "/hidden_data/blogInfo.json", (err, buffer) => {
        let data = JSON.parse(buffer.toString());
        res.json(JSON.stringify(data.slice((req.query.page - 1) * 10, req.query.page * 10 - 1)));
    });
});

app.get('/blog/getauthor', function (req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/authorInfo.json"));
    if (req.query.name !== undefined) { 
            res.send(file[req.query.name])
            return; 
        }
    res.send(file);
});

app.get('/blog/getinfo/:entryid', function (req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/blogInfo.json", "UTF-8"));

    for (let entry in file) {
        if (file[entry].id == req.params["entryid"]) {
            res.send(file[entry]);
            return;
        }
    }
    res.send("404 File not found");
});

app.get('/blog/insert', function (req, res) {
    fs.readFile("./hidden_data/tokens.json", (err, buffer) => {
        let file = JSON.parse(buffer.toString());

        if(!req.query.token) {
            res.send('Please provide a token in the query string. Format: https://example.com/blog/insert?token=ABCDEFGHIJKLMNOPQRSTUV-_+=012345');
            return;
        }

        if (file.find((element) => { if (element == req.query.token) { return true; } })) {
            res.sendFile(__dirname + "/hidden_data/bloginsert.html");
            return;
        }
        res.send('Token not found. Please check your spelling and/or insert a new token into the respective json file.');
    });
    
});

app.post('/blog/insertPOST', function (req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/tokens.json", "UTF-8"));
    if (file.find((element) => { if (element == req.fields.token) { return true; } })) {
        let blogPosts = JSON.parse(fs.readFileSync("./hidden_data/blogInfo.json", "UTF-8"));

        req.fields.id = blogPosts.length;

        if (req.fields.token == "ZXJpY25lZWRzdG9naXRndWQ=") {
            req.fields.author = "Eric Dyer";
        }

        //Set the date
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let d = new Date();
        let month = months[d.getMonth()];
        req.fields.dateposted = month + " " + d.getDate() + ", " + d.getFullYear();


        //Remove the token so it's not stored in the json
        req.fields.token = undefined;

        blogPosts.unshift(req.fields);

        fs.writeFileSync("./hidden_data/blogInfo.json", JSON.stringify(blogPosts, null));
        res.send("Success!");
    }
    else {
        res.send("Bad token. Here is your data:" + JSON.stringify(req.fields));
    }
})

app.post('/blog/fileupload', function (req, res) {
    let oldPath = req.files.image.path;
    let newPath = __dirname + "/public/imgs/" + req.files.image.name;
    fs.rename(oldPath, newPath, function(err) {
        res.send(err.code);
    });
    res.send("Success!")
})


// Start the server
const options = {
    cert: fs.readFileSync(__dirname + '/sslcert/fullchain.pem'),
    key: fs.readFileSync(__dirname + '/sslcert/privkey.pem'),
};

app.listen(80);
spdy.createServer(options, app)
    .listen(443, (error) => {
        if (error) {
            console.error(error)
            return process.exit(1)
        } else {
            console.log('Listening on port: ' + 443 + '.')
        }
    });