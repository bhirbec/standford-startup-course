const path = require('path')
const staticAsset = require('static-asset')
const express = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const fb = require('./init.js').fb
const config = require('./init.js').config
const renderHTML = require('./template.js').renderHTML
const googleAuth = require('./google.js')


let app = express()

// cookie middleware (MUST be declared before the endpoints using it)
app.use(cookieParser(config.authCookie.secret));

// for parsing form
app.use(bodyParser.urlencoded({ extended: true }));

// static asset
app.use(staticAsset(path.join(__dirname,  "../static/")));
app.use('/public', express.static(path.join(__dirname, "../static/public")));
app.use('/build', express.static(path.join(__dirname, "../static/build")));

// set auth endpoint
app.get('/oauth/google', googleAuth.oauthCallback)

app.get('/', function (req, res) {
    let data = {authUrl: googleAuth.oauthUrl}
    Object.assign(data, req.query)
    renderHTML(req, res, 'home.jsx', data)
})

// TODO: handle 404 when @handle does not exist
// TODO: merge with /me
// app.get('/@*', function (req, res) {
//     let h = req.path.substring(2).split('/')[0]
//     let p = fb.ref('handle').child(h).once('value')

//     p.then(function (snap) {
//         return fb.ref('profile').child(snap.val()).once('value')
//     }).then(function (snap) {
//         renderHTML(req, res, 'profile.jsx', snap.val())
//     }).catch(function (err) {
//         res.status(500).send(err)
//     })
// })

app.get('/me', function (req, res) {
    let id = req.signedCookies.auth.id
    let p = fb.ref('profile').child(id).once('value')

    p.then(function (snap) {
        renderHTML(req, res, 'profile.jsx', snap.val())
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

module.exports = app
