let querystring = require('querystring')
let request = require('request')

import {app, fb, config} from './init.js'


// TODO: Use promise to pipe requests
// TODO: Make `state` parameter a HMAC signature so we can verify integrity

app.get("/auth", function (req, res) {
    let q = querystring.stringify({
        response_type: 'code',
        client_id: config.linkedIn.clientId,
        client_secret: config.linkedIn.clientSecret,
        redirect_uri: config.linkedIn.redirectUri,
        state: new Date().getTime()
    })

    let linkedInURL = "https://www.linkedin.com/oauth/v2/authorization?"
    res.redirect(303, linkedInURL + q)
})

app.get("/auth/callback", function (req, res) {
    let code = req.query.code
    // let state := req.params.state
    retrieveAccessToken(res, code)
})

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
            res.send(500, err)
            return
        }

        if (token.error) {
            res.status(500).send(body.error_description)
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

        fb.ref('/users').child(data.id).set({token: token, user: data})
        res.send(JSON.stringify(data))
    })
}

app.get('/auth/accept', function (req, res) {
    res.send('Hello World!')
})

app.get('/auth/cancel', function (req, res) {
    res.send('Hello World!')
})
