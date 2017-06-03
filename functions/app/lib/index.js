const path = require('path')
const staticAsset = require('static-asset')
const express = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const init = require('./init.js')

let fb = init.fb
let config = init.config
let renderLayoutHTML = init.renderLayoutHTML
let renderHTML = init.renderHTML
let app = express()

// cookie middleware (MUST be declared before the endpoints using it)
app.use(cookieParser(config.authCookie.secret));

// for parsing form
app.use(bodyParser.urlencoded({ extended: true }));

// static asset
app.use(staticAsset(path.join(process.cwd(),  "app/static/")));
app.use('/public', express.static(path.join(process.cwd(), "app/static/public")));

app.get('/', function (req, res) {
    renderHTML(req, res, 'home.jsx', req.query)
})

app.get('/thanks', function (req, res) {
    renderHTML(req, res, 'thanks.jsx', {})
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
        renderHTML(req, res, 'public/profile.jsx', snap.val())
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

app.get('/me', function (req, res) {
    let id = req.signedCookies.auth.id
    let p = fb.ref('profile').child(id).once('value')

    p.then(function (snap) {
        renderHTML(req, res, 'public/profile.jsx', snap.val())
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

module.exports = app
