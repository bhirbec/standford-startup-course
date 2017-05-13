import express from 'express'
import * as admin from 'firebase-admin'
import * as config from './config.json'

// TODO: Set up rules on FB
admin.initializeApp({
  credential: admin.credential.cert(require(config.firebase.creds)),
  databaseURL: config.firebase.url
})

let app = express()
let fb = admin.database()

export {app, fb, config}
