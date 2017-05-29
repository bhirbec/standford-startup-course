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
  layout: jsx.server(read(path.join(__dirname, '../home/layout.jsx'), 'utf-8'), {raw: true}),
  home: jsx.server(read(path.join(__dirname, '../home/home.jsx'), 'utf-8'), {raw: true}),
  thanks: jsx.server(read(path.join(__dirname, '../home/thanks.jsx'), 'utf-8'), {raw: true}),
  profile: jsx.server(read(path.join(__dirname, '../home/profile.jsx'), 'utf-8'), {raw: true}),
};

function renderHTML(req, res, templ, data) {

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

export {fb, config, renderHTML}
