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

function renderHTML(req, res, path, data) {

    class Content extends Component {
        render() {
            let templ = loadTemplate(path)
            return templ(this)
        }
    }
    Content.defaultProps = data

    let context = {}
    context.data = data
    context.asset = req.assetFingerprint
    context.Content = Content

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    let layout = loadTemplate('public/layout.jsx')
    res.end('<!DOCTYPE html>\n' + layout(context, {html: true}));
}

let templates = {}

function loadTemplate(filePath) {
    let temp = templates[filePath];
    if (temp == undefined) {
        let str = read(path.join(__dirname, '../app/', filePath), 'utf-8')
        templates[filePath] = jsx.server(str, {raw: true})
    }
    return templates[filePath]
}

export {fb, config, renderHTML}
