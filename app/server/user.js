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
    let profile

    fb.ref('profile').child(uid).once('value').then(snap => {
        profile = snap.val()
        return fb.ref('profile').child(uid).remove()
    })
    .then(() => {
        return removeReviews("fromUid", uid)
    })
    .then(() => {
        return removeReviews("toUid", uid)
    })
    .then(snap => {
        return unindexProfile(uid)
    })
    .then(() => {
        return notifyAccountDeletion(profile)
    })
    .then(() => {
        console.log(`Successfully removed user ${uid}`)
    })
    .catch(error => {
        console.log("Error deleting user:", error);
    })
}

function removeReviews(field, uid) {
    return fb.ref('publicReviews').orderByChild(field).equalTo(uid).once('value', snap => {
        snap.forEach(child => {
            child.ref.remove()
        })
    })
}


function authenticate(idToken, uid) {
    return admin.auth().verifyIdToken(idToken).then(decodedToken => {
        let expectedUid = decodedToken.uid;
        return uid === expectedUid
    })
}

export {onCreate, onDelete, authenticate}
