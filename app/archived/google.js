const google = require('googleapis')
const oauth2 = google.oauth2('v2')
const jwt = require('jsonwebtoken')

const authCookie = require('./init.js').config.authCookie
const authConfig = require('./init.js').config.googleAuth
const fb = require('./init.js').fb

// TODO: implement incremental scope
// https://developers.google.com/identity/protocols/OAuth2WebServer#incrementalAuth

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/plus.me',
    // TODO: verify the app (https://support.google.com/code/contact/oauth_app_verification)
    // 'https://www.googleapis.com/auth/contacts.readonly'
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

function fbSignin() {
    var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}

module.exports = {
    oauthUrl: generateUrl(),
    oauthCallback: oauthCallback
}
