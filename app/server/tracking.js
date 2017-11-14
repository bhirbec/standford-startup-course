import http from 'http'
import querystring from 'querystring'

import {config} from './init'


export function gaEvent(uid, event, category, action) {
    // Build the post string from an object
    var body = querystring.stringify({
        v: 1,
        tid: config.googleAnalytics.trackingId,
        cid: uid,
        t: event,         // Event hit type
        ec: category,     // Event Category. Required.
        ea: action,       // Event Action. Required.
        // el: 'holiday',    // Event label.
        // ev: 300.          // Event value.
    })

    // An object of options to indicate where to post to
    var options = {
        host: 'www.google-analytics.com',
        path: '/collect',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body)
        }
    }

  // Set up the request
    var r = http.request(options, res => {
        res.setEncoding('utf8')
        res.on('data', (c) => {})
        res.on('end', () => {
            console.log(`GA: event set for event ${event}`)
        })
        res.on('error', e => {
            console.log(`GA: event failed for event ${event}`)
        })
    })

    r.write(body)
    r.end()
}
