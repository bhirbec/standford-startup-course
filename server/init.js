import express from 'express'
import * as admin from 'firebase-admin'
import cmdArgs from 'command-line-args'


let options = cmdArgs([{
	name: 'config',
	alias: 'c',
	type: String,
	defaultValue: '../secrets/config-dev.json'}
])

let config = require(options.config)

// TODO: Set up rules on FB
admin.initializeApp({
  credential: admin.credential.cert(require(config.firebase.creds)),
  databaseURL: config.firebase.url
})

let app = express()
let fb = admin.database()

export {app, fb, config}
