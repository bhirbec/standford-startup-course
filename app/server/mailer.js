import mailgun from 'mailgun-js'
import {fb, config} from './init'


let fromEmail = `LetsResume <team@${config.mailgun.domain}>`

let mailer = mailgun({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain
})


function notifyInvite(snap) {
    let data = snap.val()
    let ref = fb.ref('profile').child(data.fromUid).child('view/identity').once('value')

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

    // TODO: use promise.all()?
    let reviewerRef = fb.ref('profile').child(review.fromUid).child('view/identity').once('value')
    let revieweeRef = fb.ref('profile').child(review.toUid).child('view/identity').once('value')
    let revieweeEmailRef = fb.ref('profile').child(review.toUid).child('contactDetails/email').once('value')
    let reviewee, revieweeEmail, reviewer

    return reviewerRef.then((snap) => {
        reviewer = snap.val()
        return revieweeRef
    })
    .then(snap => {
        reviewee = snap.val()
        return revieweeEmailRef
    })
    .then(snap => {
        revieweeEmail = snap.val()
        return
    })
    .then(() => {
        return send({
            from: fromEmail,
            to: revieweeEmail,
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

function notifyAccountDeletion(profile) {
    let templ = layout(`
        Hi ${profile.view.identity.firstname},

        <p style="margin:20px 0">
            Your account has been deleted. We hope to see you again soon.
        </p>
    `)

    return send({
        from: fromEmail,
        to: profile.contactDetails.email,
        subject: `Your account has been deleted!`,
        html: templ
    })
}


function notifyMessage(text, from, to) {
    let templ = layout(`
        Hi ${to.firstname},

        <p style="margin:20px 0">
            You've received a message from
            <a href="${config.web.url}/in/${from.uid}" style="text-decoration:none; color: #15c" target="_blank">
                <strong>${from.firstname} ${from.lastname}</strong></a>:
        </p>
        <p style="margin:20px 0">
            <i><pre style="font-family: Arial">&ldquo;${trim(text)}&rdquo;</pre></i>
        </p>
    `)

    return send({
        "h:Reply-To": `${from.firstname} ${from.lastname} <${from.email}>`,
        from: fromEmail,
        to: to.email,
        subject: `You've received a message!`,
        html: templ
    })
}

function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
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
    return mailer.messages().send(data).catch((err) => {
        throw `Mailgun returned an error: ${err}`
    })
}

export {notifyInvite, notifyReview, notifyAccountDeletion, notifyMessage}
