const path = require('path')
const staticAsset = require('static-asset')
const express = require('express')

import {renderHTML} from './template.js'
import React from 'react'
import {StaticRouter} from 'react-router'
import {App} from '../client/app'
import {fb} from './init.js'


let app = express()

// static asset
app.use(staticAsset(path.join(__dirname,  "../static/")));
app.use('/public', express.static(path.join(__dirname, "../static/public")));
app.use('/build', express.static(path.join(__dirname, "../static/build")));


// TODO: remove flash when app is rendered server side
function MakeAppRoot(req, serverData) {
    class root extends React.Component {
        render() {
            return <StaticRouter location={req.url} context={{}}>
                <App isLogged={false} fbUser={null} serverData={serverData} />
            </StaticRouter>
        }
    }
    return root
}

app.get('/in/:id', function (req, res) {
    // TODO: remove code duplication in componentDidMount
    let p = fb.ref('profile').child(req.params.id).once('value')

    p.then((snap) => {
        let root = MakeAppRoot(req, snap.val()  )
        renderHTML(req, res, root)
    }).catch(function (err) {
        res.status(500).send(err)
    })
})

app.get('*', function (req, res) {
    let root = MakeAppRoot(req, {})
    renderHTML(req, res, root)
})

module.exports = app
