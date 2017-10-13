import {stringify} from 'querystring'
import requestPromise from 'request-promise'

import {fb, config} from './init'


let domain = config.mailgun.domain
let fromEmail = `LetsResume <team@${config.mailgun.domain}>`
let baseURL = `https://api:${config.mailgun.apiKey}@api.mailgun.net/v3/`


function notifyInvite(snap) {
    let data = snap.val()
    let ref = fb.ref('profile').child(data.fromUid).child('info').once('value')

    return ref.then((snap) => {
        return snap.val()
    })
    .then((reviewer) => {
        return send({
            from: fromEmail,
            to: data.toEmail,
            subject: `Please review ${reviewer.firstname} ${reviewer.lastname}`,
            html: inviteTemplate(reviewer, data.fromUid)
        })
    })
    .then((resp) => {
        console.info(`Email queued (${resp.id})`)
    })
    .catch((err) => {
        console.error('ERROR:', err)
    })
}


function notifyReview(snap) {
    let review = snap.val()
    let reviewerRef = fb.ref('profile').child(review.fromUid).child('info').once('value')
    let revieweeRef = fb.ref('profile').child(review.toUid).child('info').once('value')
    let reviewee, reviewer

    return reviewerRef.then((snap) => {
        reviewer = snap.val()
        return revieweeRef
    })
    .then((snap) => {
        reviewee = snap.val()
        return
    })
    .then(() => {
        return send({
            from: fromEmail,
            to: reviewee.email,
            subject: `You received a review from ${reviewer.firstname} ${reviewer.lastname}`,
            html: reviewTemplate(reviewer, reviewee)
        })
    })
    .then((resp) => {
        console.info(`Email queued (${resp.id})`)
    })
    .catch((err) => {
        console.error('ERROR:', err)
    })
}


function inviteTemplate(reviewer, profileId) {
    return layout(`
        Hi,

        <p style="margin:20px 0">
            You've received a review request from ${reviewer.firstname} ${reviewer.lastname}!
            Please check out
            <a href="${config.web.url}/in/${profileId}" style="text-decoration:none; color: #15c" target="_blank">
                <strong>${reviewer.firstname} on LetsResume.com</strong>
            </a>
            and add your review.
        </p>
    `)
}


function reviewTemplate(reviewer, reviewee) {
    return layout(`
        Hey ${reviewee.firstname},

        <p style="margin:20px 0">
            You've received a review from ${reviewer.firstname} ${reviewer.lastname}!
            Please check
            out <a href="${config.web.url}/in/${reviewee.uid}" style="text-decoration:none; color: #15c" target="_blank"><strong>your profile on LetsResume.com</strong></a>.
        </p>

        <p style="margin:20px 0">
            Return the favor! Give
            <a href="${config.web.url}/in/${reviewee.uid}" style="text-decoration:none; color: #15c" target="_blank"><strong>${reviewer.firstname} ${reviewer.lastname}</strong></a> a review back!
        </p>
    `)
}


function layout(content) {
    return `
        <div marginwidth="0"
             marginheight="0"
             style="margin:0; padding:0; margin:0; font-family:&quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#555">
            <div style="line-height:20.8px; margin-left:40px">
                ${content}

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

export {notifyInvite, notifyReview}
