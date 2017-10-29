import {admin, fb} from './init'
import {unindexProfile} from './algolia-indexer'
import {notifyAccountDeletion} from './mailer'


function onCreate(event) {
    const user = event.data

    let photoURL = ""
    if (user.providerData && user.providerData[0]) {
        photoURL = user.providerData[0].photoURL
    }

    // TODO: split firstname and lastname
    return fb.ref(`profile/${user.uid}`).set({
        view: {
            identity: {
                uid: user.uid,
                firstname: user.displayName || "",
                lastname: "",
                photoURL: photoURL,
            },
        },
        contactDetails: {
            email: user.email,
            emailVerified: user.emailVerified || false,
        },
        providerData: user.providerData || "",
        isAnonymous: user.isAnonymous || false,
        metadata: user.metadata || "",
    })
}

function onDelete(event) {
    let uid = event.data.uid
    let profileSnap

    fb.ref('profile').child(uid).once('value').then(snap => {
        profileSnap = snap
        return removeReviews(profileSnap)
    })
    .then(() => {
        return profileSnap.ref.remove()
    })
    .then(snap => {
        return unindexProfile(uid)
    })
    .then(() => {
        return notifyAccountDeletion(profileSnap.val())
    })
    .then(() => {
        console.log(`Successfully removed user ${uid}`)
    })
    .catch(error => {
        console.log("Error deleting user:", error)
    })
}


function removeReviews(profileSnap) {
    let data = {}

    profileSnap.child('reviewsSent').forEach(profileSnap => {
        profileSnap.forEach(revSnap => {
            data[`profile/${profileSnap.key}/reviewsReceived/${revSnap.key}`] = null
        })
    })

    profileSnap .child('view/reviewsReceived').forEach(revSnap => {
        let rev = revSnap.val()
        data[`profile/${rev.fromUid}/reviewsSent/${rev.toUid}/${revSnap.key}`] = null
    })

    return fb.ref().update(data)
}


function authenticate(idToken, uid) {
    return admin.auth().verifyIdToken(idToken).then(decodedToken => {
        let expectedUid = decodedToken.uid;
        return uid === expectedUid
    })
}

export {onCreate, onDelete, authenticate}
