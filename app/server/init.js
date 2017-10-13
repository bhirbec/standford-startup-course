import path from 'path'

import admin from 'firebase-admin'
import cmdArgs from 'command-line-args'


const options = cmdArgs([{
    name: 'config',
    alias: 'c',
    type: String,
    defaultValue: 'secrets/config-prod.json'
}])

const config = require(path.join(__dirname, '..', options.config))

// load firebase
const fbCredsPath = path.join(__dirname, '..', config.firebaseAdmin.creds)
const fbConfig = require(fbCredsPath)

admin.initializeApp({
  credential: admin.credential.cert(fbConfig),
  databaseURL: config.firebaseAdmin.url
})

const fb = admin.database()

export {admin, fb, config}
