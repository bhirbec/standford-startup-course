const google = require('googleapis')
const oauth2 = google.oauth2('v2')
const jwt = require('jsonwebtoken')

const authCookie = require('./init.js').config.authCookie
const authConfig = require('./init.js').config.googleAuth
const fb = require('./init.js').fb

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/contacts.readonly'
]

function oauthCallback(req, res) {
    let client = newClient()

    client.getToken(req.query.code, function (err, tokens) {
        if (err != undefined) {
            res.status(500).send('Google oauth failed ' + err)
        } else {
            getProfile(tokens, res)
        }
    })
}

function generateUrl() {
    let client = newClient()
    return client.generateAuthUrl({scope: scopes})
}

function newClient() {
    return new google.auth.OAuth2(
      authConfig.clientId,
      authConfig.clientSecret,
      authConfig.redirectUri
    )
}

function getProfile(tokens, res) {
    let client = newClient()
    client.setCredentials(tokens)

    oauth2.userinfo.get({auth: client}, (err, profile) => {
        if (err != undefined) {
            res.status(500).send('Retrieving Google profile failed ' + err)
        } else {
            let p = fb.ref('oauth/google').child(profile.id).set(tokens)

            p.then(function () {
                return fb.ref('profile/' + profile.id).child('google-profile').set(profile)
            }).then(function () {
                let token = jwt.sign({id: profile.id}, authCookie.secret, {
                    expiresIn: 60*60*24 // expires in 24 hours
                });

                res.cookie(authCookie.name, token, {
                    maxAge: 1000 * 60 * authCookie.maxAgeMinute,
                    httpOnly: true
                })

                res.redirect(303, '/me')
            }).catch(function (err) {
                res.status(500).send('Saving profile failed ' + err)
            })
        }
    })
}

module.exports = {
    oauthUrl: generateUrl(),
    oauthCallback: oauthCallback
}
