var http = require('http'),
    path = require('path'),
    read = require('fs').readFileSync;

import staticAsset from 'static-asset'

import express from 'express'
import React from 'react'
import jsx from 'react-jsx'

import {app, config} from './init.js'
import * as auth from './auth.js'


var templates = {
  index: jsx.server(read(path.join(__dirname, '../public/index.jsx'), 'utf-8'), {raw: true}),
};

app.use(staticAsset(path.join(__dirname,  "..")));
app.use('/public', express.static(path.join(__dirname, "../public/")));

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    let data = {asset: req.assetFingerprint}
    res.end('<!DOCTYPE html>\n' + templates.index(data, {html: true}));
})

app.listen(config.web.port, config.web.host, function () {
    console.log('Starting web server on ' + config.web.host + ':' + config.web.port)
})
