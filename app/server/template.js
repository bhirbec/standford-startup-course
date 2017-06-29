const path = require('path')
const read = require('fs').readFileSync

const jsx = require('react-jsx')
const React = require('react')

const config = require('./init.js').config


function renderHTML(req, res, Content) {
    let context = {}
    context.asset = req.assetFingerprint
    context.fbConfig = config.firebaseClient
    context.Content = Content

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

module.exports = {renderHTML: renderHTML}
