'use strict';

module.exports = (function () {
    var externalRoutes = require('express').Router();

    externalRoutes.get('/', function (req, res) {
        res.send('Hello ExternalRoutes!');
    });
    externalRoutes.get('/someRoute', function (req, res) {
        res.send('Hello SomeRoute!');
    });

    return externalRoutes;
})();