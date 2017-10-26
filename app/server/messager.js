import {fb} from './init'
import {authenticate} from './user'

import {notifyMessage} from './mailer'


function sendMessage(snap) {
    let data = snap.val()
    let messageKey = snap.key
    let fromIdentity
    let toIdentity

    return authenticate(data.idToken, data.fromUid).then(ok => {
        if (!ok) {
            Throw('Authentication failed')
        }

        let fromRef = fb.ref('profile').child(data.fromUid)
        let toRef = fb.ref('profile').child(data.toUid)

        return Promise.all([
            fromRef.child('view/identity').once('value'),
            fromRef.child('contactDetails/email').once('value'),
            toRef.child('view/identity').once('value'),
            toRef.child('contactDetails/email').once('value'),
        ])
    })
    .then(snaps => {
        fromIdentity = snaps[0].val()
        fromIdentity.email = snaps[1].val()
        toIdentity = snaps[2].val()
        toIdentity.email = snaps[3].val()

        let now = new Date().getTime()
        let updates = {}
        updates[`profile/${fromIdentity.uid}/messages/sent/${messageKey}`] = {
            text: data.text,
            to: toIdentity,
            date: now,
        }
        updates[`profile/${toIdentity.uid}/messages/received/${messageKey}`] = {
            text: data.text,
            from: fromIdentity,
            date: now,
        }
        return fb.ref().update(updates)
    })
    .then(() => {
        return notifyMessage(data.text, fromIdentity, toIdentity)
    })
    .then(() => {
        let msg = 'Your message has been sent.'
        return fb.ref('profile').child(data.fromUid).child('flash').push().set(msg)
    })
    .then(() => {
        console.log('Message sent')
        return snap.ref.remove()
    }).catch(error => {
        console.log(error)
    })
}

export {sendMessage}
