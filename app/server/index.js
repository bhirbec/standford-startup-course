const path = require('path')
const staticAsset = require('static-asset')
const express = require('express')

const renderHTML = require('./template.js').renderHTML
const Home = require('../client/home')
import {Profile} from '../client/publicprofile'
import {fb} from './init.js'

// TODO: remove flash when app is rendered server side
let app = express()

// static asset
app.use(staticAsset(path.join(__dirname,  "../static/")));
app.use('/public', express.static(path.join(__dirname, "../static/public")));
app.use('/build', express.static(path.join(__dirname, "../static/build")));

app.get('/', function (req, res) {
    renderHTML(req, res, Home)
})

app.get('/me', function (req, res) {
    renderHTML(req, res, Home)
})

app.get('/in/:id', function (req, res) {
    let p = fb.ref('profile').child(req.params.id).once('value')

    p.then((snap) => {
        class Content extends Profile {}
        Content.defaultProps = {profile: snap.val()}
        renderHTML(req, res, Content)
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

module.exports = app
