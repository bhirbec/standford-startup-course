const path = require('path')
const read = require('fs').readFileSync

const jsx = require('react-jsx')
const React = require('react')


function renderHTML(req, res, path, data) {

    class Content extends React.Component {
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
        let str = read(path.join(__dirname, '../templates', filePath), 'utf-8')
        templates[filePath] = jsx.server(str, {raw: true})
    }
    return templates[filePath]
}

module.exports = {renderHTML: renderHTML}
