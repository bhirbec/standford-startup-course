var path = require('path'),
    read = require('fs').readFileSync;

const cookieParser = require('cookie-parser')
const admin = require('firebase-admin')
const cmdArgs = require('command-line-args')

const jsx = require('react-jsx')
const React = require('react')
const Component = React.Component

let options = cmdArgs([{
    name: 'config',
    alias: 'c',
    type: String,
    defaultValue: path.join(process.cwd(), 'app/secrets/config-dev.json')
}])

let config = require(options.config)

// TODO: Set up rules on FB
let fbCredsPath = path.join(process.cwd(), config.firebase.creds)

admin.initializeApp({
  credential: admin.credential.cert(require(fbCredsPath)),
  databaseURL: config.firebase.url
})

let fb = admin.database()

function renderHTML(req, res, path, data) {

    class Content extends Component {
        render() {
            let templ = loadTemplate(path)
            return templ(this)
        }
    }
    Content.defaultProps = data

    let context = {}
    context.data = data
    context.asset = req.assetFingerprint
    context.Content = Content

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    let layout = loadTemplate('layout.jsx')
    res.end('<!DOCTYPE html>\n' + layout(context, {html: true}));
}

let templates = {}

function loadTemplate(filePath) {
    let temp = templates[filePath];
    if (temp == undefined) {
        let str = read(path.join(process.cwd(), 'app/templates', filePath), 'utf-8')
        templates[filePath] = jsx.server(str, {raw: true})
    }
    return templates[filePath]
}

module.exports = {fb:fb, config: config, renderHTML: renderHTML}
