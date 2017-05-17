var path = require('path')
import staticAsset from 'static-asset'

import express from 'express'
import cookieParser from 'cookie-parser'

import {fb, config, renderLayoutHTML, renderHTML} from './init.js'
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
    renderHTML(req, res, 'home_simple', {})
})

app.get('/thanks', function (req, res) {
    renderHTML(req, res, 'thanks', {})
})

// TODO: handle 404 when @handle does not exist
// TODO: merge with /me
app.get('/@*', function (req, res) {
    let h = req.path.substring(2).split('/')[0]
    let p = fb.ref('handle').child(h).once('value')

    p.then(function (snap) {
        return fb.ref('profile').child(snap.val()).once('value')
    }).then(function (snap) {
        renderHTML(req, res, 'profile', snap.val())
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

app.get('/me', function (req, res) {
    let id = req.signedCookies.auth.id
    let p = fb.ref('profile').child(id).once('value')

    p.then(function (snap) {
        renderHTML(req, res, 'profile', snap.val())
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

app.listen(config.web.port, config.web.host, function () {
    console.log('Starting web server on ' + config.web.host + ':' + config.web.port)
})
