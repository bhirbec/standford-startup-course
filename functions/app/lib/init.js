const path = require('path')

const cookieParser = require('cookie-parser')
const admin = require('firebase-admin')
const cmdArgs = require('command-line-args')


const options = cmdArgs([{
    name: 'config',
    alias: 'c',
    type: String,
    defaultValue: path.join(process.cwd(), 'app/secrets/config-dev.json')
}])

const config = require(options.config)

// TODO: Set up rules on FB
const fbCredsPath = path.join(process.cwd(), config.firebase.creds)

admin.initializeApp({
  credential: admin.credential.cert(require(fbCredsPath)),
  databaseURL: config.firebase.url
})

module.exports = {
    fb: admin.database(),
    config: config
}
