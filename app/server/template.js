import path from 'path'
import {readFileSync as read} from 'fs'

import jsx from 'react-jsx'
import React from 'react'

import {config} from './init.js'


function renderHTML(req, res, Content) {
    let context = {}
    context.Content = Content
    context.asset = req.assetFingerprint
    context.config = {
        fb: config.firebaseClient,
        algolia: {
            applicationId: config.algolia.applicationId,
            searchOnlyApiKey: config.algolia.searchOnlyApiKey
        }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    let layout = loadTemplate('layout.jsx')
    try {
        res.end('<!DOCTYPE html>\n' + layout(context, {html: true}));
    } catch (err) {
        console.log('===', err)
    }
}

let templates = {}

function loadTemplate(filePath) {
    let temp = templates[filePath];
    if (temp == undefined) {
        let str = read(path.join(__dirname, '../templates', filePath), 'utf-8')
        templates[filePath] = jsx.server(str, {raw: true})
    }
    return templates[filePath]
}

export {renderHTML}
