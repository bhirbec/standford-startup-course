let querystring = require('querystring')
let request = require('request')

import {fb, config} from './init.js'


// TODO: Use promise to pipe requests
// TODO: Make `state` parameter a HMAC signature so we can verify integrity
module.exports = function (app) {
    app.get("/auth", auth)
    app.get("/auth/callback", callback)
}

function auth(req, res) {
    let q = querystring.stringify({
        response_type: 'code',
        client_id: config.linkedIn.clientId,
        client_secret: config.linkedIn.clientSecret,
        redirect_uri: config.linkedIn.redirectUri,
        state: new Date().getTime()
    })

    let linkedInURL = "https://www.linkedin.com/oauth/v2/authorization?"
    res.redirect(303, linkedInURL + q)
}

function callback(req, res) {
    let code = req.query.code
    // let state := req.params.state
    // req.secret = config.authCookie.secret
    retrieveAccessToken(res, code)
}

function retrieveAccessToken(res, code) {
    let reqOptions = {
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: 'authorization_code',
            code: code,
            client_id: config.linkedIn.clientId,
            client_secret: config.linkedIn.clientSecret,
            redirect_uri: config.linkedIn.redirectUri
        },
        json: true
    }

    request.post(reqOptions, function(err, httpResponse, token) {
        if (err != undefined) {
            res.status(500).send('Post to linkedin failed: ' + err)
            return
        }

        if (token.error) {
            res.status(500).send('Cannot retrieve token: ' + token.error_description)
            return
        }

        getUserId(res, token)
    })
}

function getUserId(res, token) {
    let url = "https://api.linkedin.com/v1/people/~:("
        + "id,"
        + "email-address,"
        + "first-name,"
        + "last-name,"
        + "maiden-name,"
        + "formatted-name,"
        + "phonetic-first-name,"
        + "phonetic-last-name,"
        + "formatted-phonetic-name,"
        + "headline,"
        + "location,"
        + "industry,"
        + "current-share,"
        + "num-connections,"
        + "num-connections-capped,"
        + "summary,"
        + "specialties,"
        + "positions:("
            + "id,"
            + "title,"
            + "summary,"
            + "start-date,"
            + "end-date,"
            + "is-current,"
            + "company:("
                + "id,"
                + "name,"
                + "type,"
                + "size,"
                + "industry,"
                + "ticker)"
        + "),"
        + "picture-url,"
        + "picture-urls::(original),"
        + "site-standard-profile-request,"
        + "api-standard-profile-request,"
        + "public-profile-url"
    + ")?format=json"

    let reqOptions = {
        url: url,
        headers: {'Authorization': 'Bearer ' + token.access_token},
        json: true
    }

    request.get(reqOptions, function (err, httpResponse, data) {
        if (err != undefined) {
            res.send(500, err)
            return
        }

        if (data.errorCode != undefined) {
            res.send(data.status, data.message)
            return
        }

        saveLinkedinData(token, data, res)
    })
}

function saveLinkedinData(token, data, res) {
    // TODO: open a transaction?
    let p = fb.ref('oauth/linkedin').child(data.id).set(token)

    p.then(function () {
        // TODO generate id to handle duplicate with other oauth provider?
        return fb.ref('profile').child(data.id).once('value')
    }).then(function (snap) {
        if (!snap.exists()) {
            return createProfile(data)
        } else {
            return null
        }
    }).then(function () {
        res.cookie(config.authCookie.name, {id: data.id}, {
            maxAge: 1000 * 60 * config.authCookie.maxAgeMinute,
            httpOnly: true,
            signed: true
        })

        res.redirect(303, '/me')
    }).catch(function (err) {
        console.log('Unexpected error with Firebase: ', err)
        res.redirect(303, '/')
    })
}

function createProfile(data) {
    let p = fb.ref('profile').child(data.id).set(data)
    let h = createHandle(data)
    // TODO: do not override handle if it already exist
    p.then(() => fb.ref('handle').child(h).set(data.id))
    return p
}

function createHandle(data) {
    let h = data.firstName.substring(0, 1) + data.lastName
    return h.toLowerCase()
}
