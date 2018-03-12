const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
var fs = require("fs"),json;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.get('/blog/post', function(req, res) {
    res.sendFile(__dirname + "/public/blog/post.html");
});

app.get('/blog/getdata', function (req, res) {
    let file = fs.readFileSync("./hidden_data/blogInfo.json", "UTF-8");
    if(req.query.page == undefined) { req.query.page = 1; }

    res.set({ 'content-type': 'application/json; charset=utf-8' });
    res.send(JSON.parse(file).slice((req.query.page - 1) * 10, req.query.page * 10));
});

app.get('/blog/getauthor', function (req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/authorInfo.json", "UTF-8"));
    if(req.query.name != undefined) { res.send(file[req.query.name]) }
    else { res.send(file); }
});

app.get('/blog/getinfo/:entryid', function(req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/blogInfo.json", "UTF-8"));

    for(let entry in file) {
        if (file[entry].id == req.params["entryid"]) {
            res.send(file[entry]);
            return;
        }
    }
    res.send("404 File not found");
});

app.get('/blog/insert', function(req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/tokens.json", "UTF-8"));
    if(file.find((element) => { if(element == req.query.token) {return true; } })) {
        res.sendFile(__dirname + "/hidden_data/bloginsert.html");
    }
    else {
        res.send("Token not found");
    }
});

app.post('/blog/insert', function(req, res) {
    let file = JSON.parse(fs.readFileSync("./hidden_data/tokens.json", "UTF-8"));
    if(file.find((element) => { if(element == req.body.token) { return true; } })) {
        let blogPosts = JSON.parse(fs.readFileSync("./hidden_data/blogInfo.json", "UTF-8"));

        req.body.id = blogPosts.length;
        
        if(req.body.token == "ZXJpY25lZWRzdG9naXRndWQ=") {
            req.body.author = "Eric Dyer";
        }

        //Remove the token so it's not stored in the json
        req.body.token = undefined;

        blogPosts.unshift(req.body);

        fs.writeFileSync("./hidden_data/blogInfo.json", JSON.stringify(blogPosts, null));
        res.send("Success!");
    }
    else {
        res.send("Bad token. Here is your data:" + JSON.stringify(req.body));
    }
})

app.listen(8080, () => console.log('Example app listening on port 8080!'))