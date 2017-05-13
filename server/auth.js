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

        // access_token
        // expires_in
        getUserId(res, token)
    })
}

function getUserId(res, token) {
    let reqOptions = {
        url: 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name)?format=json',
        headers: {'Authorization': 'Bearer ' + token.access_token},
        json: true
    }

    request.get(reqOptions, function(err, httpResponse, user) {
        if (err != undefined) {
            res.send(500, err)
            return
        }

        let data = {token: token, user: user}
        fb.ref("/users").child(user.id).set(data)
        res.send(JSON.stringify(user))
    })
}

app.get("/auth/accept", function (req, res) {
    res.send('Hello World!')
})

app.get("/auth/cancel", function (req, res) {
    res.send('Hello World!')
})
