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

    request.get(reqOptions, function(err, httpResponse, data) {
        if (err != undefined) {
            res.send(500, err)
            return
        }

        if (data.errorCode != undefined) {
            res.send(data.status, data.message)
            return
        }

        let p = fb.ref('oauth/linkedin').child(data.id).set({token: token, user: data})

        p.then(function (err) {
            if (err != undefined) {
                console.log('Saving user to Firebase failed: ', err)
                res.send(500, err)
                return
            }

            let options = {
                maxAge: 1000 * 60 * config.authCookie.maxAgeMinute,
                httpOnly: true,
                signed: true
            }

            res.cookie(config.authCookie.name, {id: data.id}, options)
            res.redirect(303, '/me')
        })

        p.catch(function (error) {
            console.log('Unexpected error with Firebase: ', error)
            res.redirect(303, '/')
        })
    })
}
