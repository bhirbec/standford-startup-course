const path = require('path')
const staticAsset = require('static-asset')
const express = require('express')

const renderHTML = require('./template.js').renderHTML


let app = express()

// static asset
app.use(staticAsset(path.join(__dirname,  "../static/")));
app.use('/public', express.static(path.join(__dirname, "../static/public")));
app.use('/build', express.static(path.join(__dirname, "../static/build")));

app.get('/', function (req, res) {
    renderHTML(req, res, {})
})

app.get('/me', function (req, res) {
    renderHTML(req, res, {})
})

module.exports = app
