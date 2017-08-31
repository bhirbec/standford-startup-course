import {stringify} from 'querystring'
import requestPromise from 'request-promise'

import Queue from 'firebase-queue'

import {fb, config} from '../server/init.js'


let domain = config.mailgun.domain
let fromEmail = `LetsResume <team@${config.mailgun.domain}>`
let baseURL = `https://api:${config.mailgun.apiKey}@api.mailgun.net/v3/`


function worker() {
    let ref = fb.ref('queue/email')

    var queue = new Queue(ref, (data, progress, resolve, reject) => {
        invite(data, progress).then((resp) => {
            console.info(`Email queued (${resp.id})`)
            resolve()
        }).catch((err) => {
            console.error('ERROR:', err)
            reject()
        })
    })
}

function mailer(snap) {
    return invite(snap.val()).then((resp) => {
        console.info(`Email queued (${resp.id})`)
        snap.ref.remove()
    }).catch((err) => {
        console.error('ERROR:', err)
    })
}

function invite(data) {
    let ref = fb.ref('profile').child(data.profileId).child('info').once('value')

    return ref.then((snap) => {
        return snap.val()
    })
    .then((reviewer) => {
        return send({
            from: fromEmail,
            to: data.toEmail,
            subject: `Please review ${reviewer.firstname} ${reviewer.lastname}`,
            html: template(reviewer, data.profileId)
        })
    })
}

function template(reviewer, profileId) {
    return `
        <div marginwidth="0"
             marginheight="0"
             style="margin:0; padding:0; margin:0; font-family:&quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#555">
            <div style="line-height:20.8px; margin-left:40px">
                Hi,

                <p style="margin:20px 0">
                    You've received a review request from ${reviewer.firstname} ${reviewer.lastname}!
                    Please check out
                    <a href="${config.web.url}/in/${profileId}" style="text-decoration:none; color: #15c" target="_blank">
                        <strong>${reviewer.firstname} on LetsResume.com</strong>
                    </a>
                    and add your review.
                </p>
                <p style="margin:20px 0">
                    <a href="${config.web.url}" style="text-decoration:none; color: #15c" target="_blank">
                        <strong>LetsResume</strong>
                    </a>
                    is a crowd-sourced resume building platform that lets you create an
                    authentic and powerful resume.
                </p>
                <p style="margin:20px 0">
                    Thanks,<br />
                    LetsResume Team
                </p>
            </div>
        </div>
    `
}

function send(data) {
    return requestPromise.post({
        url: baseURL + domain + '/messages?' + stringify(data),
        headers: {"Content-Type": "application/json"},
        json: true
    }).catch((err) => {
        throw `Mailgun returned an error: ${err.statusCode} - ${err.error.message}`
    })

}

export {worker, mailer}
