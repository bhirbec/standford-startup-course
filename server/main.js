var path = require('path')
import staticAsset from 'static-asset'

import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'

import {fb, config, renderLayoutHTML, renderHTML} from './init.js'
import auth from './auth.js'


let app = express()

// cookie middleware (MUST be declared before the endpoints using it)
app.use(cookieParser(config.authCookie.secret));

// for parsing form
app.use(bodyParser.urlencoded({ extended: true }));

// static asset
app.use(staticAsset(path.join(__dirname,  "..")));
app.use('/static', express.static(path.join(__dirname, "../static/")));

// setup auth endpoints
auth(app)

app.get('/', function (req, res) {
    renderHTML(req, res, 'home', req.query)
})

app.get('/thanks', function (req, res) {
    renderHTML(req, res, 'thanks', {})
})

app.post('/register', function (req, res) {
    if (req.body.email == '') {
        res.redirect(303, '/')
        return
    }

    let data = {}
    Object.assign(data, req.body)
    Object.assign(data, req.params)

    fb.ref('signup').push(data, function () {
        res.redirect(303, '/thanks')
    })
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
