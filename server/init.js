var path = require('path'),
    read = require('fs').readFileSync;

import cookieParser from 'cookie-parser'
import * as admin from 'firebase-admin'
import cmdArgs from 'command-line-args'

import React, { Component } from 'react';
import jsx from 'react-jsx'


let options = cmdArgs([{
    name: 'config',
    alias: 'c',
    type: String,
    defaultValue: '../secrets/config-dev.json'}
])

let config = require(options.config)

// TODO: Set up rules on FB
admin.initializeApp({
  credential: admin.credential.cert(require(config.firebase.creds)),
  databaseURL: config.firebase.url
})

let fb = admin.database()

let templates = {
  layout: jsx.server(read(path.join(__dirname, '../app/layout.jsx'), 'utf-8'), {raw: true}),
  home: jsx.server(read(path.join(__dirname, '../app/home.jsx'), 'utf-8'), {raw: true}),
  home_simple: jsx.server(read(path.join(__dirname, '../app/home_simple.jsx'), 'utf-8'), {raw: true}),
  profile: jsx.server(read(path.join(__dirname, '../app/profile.jsx'), 'utf-8'), {raw: true}),
  thanks: jsx.server(read(path.join(__dirname, '../app/thanks.jsx'), 'utf-8'), {raw: true}),
};

function renderLayoutHTML(req, res, templ, data) {
    class Content extends Component {
        render() { return templates[templ](this) }
    }
    Content.defaultProps = data

    let context = {}
    context.data = data
    context.asset = req.assetFingerprint
    context.Content = Content

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<!DOCTYPE html>\n' + templates.layout(context, {html: true}));
}

function renderHTML(req, res, templ, data) {
    let context = {}
    context.data = data
    context.asset = req.assetFingerprint

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<!DOCTYPE html>\n' + templates[templ](context, {html: true}));
}

export {fb, config, renderLayoutHTML, renderHTML}
