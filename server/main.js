var http = require('http'),
    path = require('path'),
    read = require('fs').readFileSync;

import express from 'express';
import React from 'react';
import jsx from 'react-jsx';

import {app, config} from './init.js'
import * as auth from './auth.js'


app.use('/css', express.static('../public-site/public/css'))
app.use('/font-awesome', express.static('../public-site/public/font-awesome'))
app.use('/fonts', express.static('../public-site/public/fonts'))
app.use('/img', express.static('../public-site/public/img'))
app.use('/js', express.static('../public-site/public/js'))


app.get('/', function (req, res) {
    var templates = {
      index: jsx.server(read(path.join(__dirname, '../public-site/public/index.jsx'), 'utf-8'), {raw: true}),
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    let data = {}
    res.end('<!DOCTYPE html>\n' + templates.index(data, {html: true}));
})

app.listen(config.web.port, config.web.host, function () {
    console.log('Starting web server on ' + config.web.host + ':' + config.web.port)
})
