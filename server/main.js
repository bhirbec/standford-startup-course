var path = require('path')
import staticAsset from 'static-asset'

import express from 'express'
import cookieParser from 'cookie-parser'

import {fb, config, renderHTML} from './init.js'
import auth from './auth.js'


let app = express()

// cookie middleware (MUST be declared before the endpoints using it)
app.use(cookieParser(config.authCookie.secret));

// static asset
app.use(staticAsset(path.join(__dirname,  "..")));
app.use('/public', express.static(path.join(__dirname, "../public/")));

// setup auth endpoints
auth(app)

app.get('/', function (req, res) {
    renderHTML(req, res, 'home', {})
})

app.get('/me', function (req, res) {
    let success = function (snap) {
        renderHTML(req, res, 'profile', snap.val().user)
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
