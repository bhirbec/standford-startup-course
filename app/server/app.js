import express from 'express'
import path from 'path'
import staticAsset from 'static-asset'
import React from 'react'
import {StaticRouter} from 'react-router'

import {App} from '../client/app'
import {fb} from './init'
import {renderHTML} from './template'


let app = express()

// static asset
app.use(staticAsset(path.join(__dirname,  "../static/")))

// TODO: do we need this on prod?
app.use('/public', express.static(path.join(__dirname, "../static/public")))
app.use('/build', express.static(path.join(__dirname, "../static/build")))


// TODO: remove flash when app is rendered server side
function MakeAppRoot(req, serverData) {
    class root extends React.Component {
        render() {
            return <StaticRouter location={req.url} context={{}}>
                <App fbUser={null} serverData={serverData} />
            </StaticRouter>
        }
    }
    return root
}

app.get('/in/:id', (req, res) => {
    // TODO: remove code duplication in componentDidMount
    let p = fb.ref('profile').child(req.params.id).child('view').once('value')

    p.then(snap => {
        let root = MakeAppRoot(req, snap.val())
        renderHTML(req, res, root)
    }).catch(err => {
        res.status(500).send(err)
    })
})

app.get('*', (req, res) => {
    let root = MakeAppRoot(req, {})
    renderHTML(req, res, root)
})

// why does "export default app" break the app?
module.exports = app
