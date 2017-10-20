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

        let p1 = fb.ref('profile').child(data.fromUid).child('info').once('value')
        let p2 = fb.ref('profile').child(data.toUid).child('info').once('value')
        return Promise.all([p1, p2])
    })
    .then(snaps => {
        fromIdentity = snaps[0].val()
        toIdentity = snaps[1].val()

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
