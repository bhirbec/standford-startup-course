const path = require('path')

const cookieParser = require('cookie-parser')
const admin = require('firebase-admin')
const cmdArgs = require('command-line-args')


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

module.exports = {
    fb: admin.database(),
    config: config
}
