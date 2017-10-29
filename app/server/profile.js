import {fb} from './init'
import {notifyReview} from './mailer'


function onIdentityUpdated(identity) {
    fb.ref('profile').child(identity.uid).child('reviewsSent').once('value').then(rootSnap => {
        let data = {}

        rootSnap.forEach(profileSnap => {
            profileSnap.forEach(revSnap => {
                data[`profile/${profileSnap.key}/view/reviewsReceived/${revSnap.key}/reviewerIdentity`] = identity
            })
        })

        return fb.ref().update(data)
    })
}

function onReviewUpdated(fromUid, toUid, revId, rev) {
    fb.ref('profile').child(fromUid).child('view/identity').once('value').then(snap => {
        rev.reviewerIdentity = snap.val()
        rev.fromUid = fromUid
        rev.toUid = toUid
        rev.revId = revId

        let updates = {}
        updates[`profile/${toUid}/view/reviewsReceived/${revId}`] = rev
        return fb.ref().update(updates)
    }).then(() => {
        return notifyReview(rev)
    })
}

function onReviewDeleted(toUid, revId) {
    return fb.ref('profile')
        .child(toUid)
        .child('view/reviewsReceived')
        .child(revId)
        .remove()
}

export {onIdentityUpdated, onReviewUpdated, onReviewDeleted}
