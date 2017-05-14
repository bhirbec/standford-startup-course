var http = require('http'),
    path = require('path'),
    read = require('fs').readFileSync;

import staticAsset from 'static-asset'

import express from 'express'
import cookieParser from 'cookie-parser'

import React from 'react'
import jsx from 'react-jsx'

import {fb, config} from './init.js'
import auth from './auth.js'


var templates = {
  index: jsx.server(read(path.join(__dirname, '../public/index.jsx'), 'utf-8'), {raw: true}),
};

let app = express()

// cookie middleware (MUST be declared before the endpoints using it)
app.use(cookieParser(config.authCookie.secret));

// static asset
app.use(staticAsset(path.join(__dirname,  "..")));
app.use('/public', express.static(path.join(__dirname, "../public/")));

// setup auth endpoints
auth(app)

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    let data = {asset: req.assetFingerprint}
    res.end('<!DOCTYPE html>\n' + templates.index(data, {html: true}));
})

app.get('/me', function (req, res) {
    let success = function (snap) {
        res.status(200).send(JSON.stringify(snap.val()))
    }

    let error = function (err) {
        res.status(500).send(err)
    }

    let id = req.signedCookies.auth.id
    fb.ref('users').child(id).once('value', success, error)
})

app.listen(config.web.port, config.web.host, function () {
    console.log('Starting web server on ' + config.web.host + ':' + config.web.port)
})
