"use strict";

const express = require("express"),
  app = express(),
  fs = require("fs"),
  url = require("url"),
  path = require("path");

app.use(require("compression")());
app.use(require("serve-favicon")("public/favicon.ico"));
app.use(require("cookie-parser")());

app.use(express.static("public"));

app.use("/", require(__dirname + "/routes/blog.js"));
app.use("/api/auth", require(__dirname + "/routes/api/api-login.js"));
app.use("/api/blog", require(__dirname + "/routes/api/api-blog.js"));

app.use("/blog", require("express-formidable")());

app.post("/blog/fileupload", function(req, res) {
  let oldPath = req.files.image.path;
  let newPath = __dirname + "/public/imgs/" + req.files.image.name;
  fs.rename(oldPath, newPath, function(err) {
    res.send(err.code);
  });
  res.send("Success!");
});

// Start the server
require("greenlock-express")
  .create({
    version: "draft-11",
    server: "https://acme-v02.api.letsencrypt.org/directory",
    configDir: "~/.config/acme/",
    email: "saghendev@gmail.com",
    approveDomains: ["saghen.com"],
    agreeTos: true,
    app: app,
    communityMember: false,
    telemetry: false
  })
  .listen(8080, 8081);
