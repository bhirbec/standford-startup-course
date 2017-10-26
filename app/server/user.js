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

function deleteUser(snap) {
    let profile
    let data = snap.val()

    authenticate(data.idToken, data.uid).then(ok => {
        if (!ok) {
            Throw('Authentication failed')
        } else {
            return fb.ref('profile').child(data.uid).once('value')
        }
    })
    .then(snap => {
        profile = snap.val()
        return admin.auth().deleteUser(data.uid)
    })
    .then(() => {
        return fb.ref('profile').child(data.uid).remove()
    })
    .then(() => {
        return removeReviews("fromUid", data.uid)
    })
    .then(() => {
        return removeReviews("toUid", data.uid)
    })
    .then(snap => {
        return unindexProfile(data.uid)
    })
    .then(() => {
        return notifyAccountDeletion(profile)
    })
    .then(() => {
        console.log(`Successfully removed user ${data.uid}`)
        return snap.ref.remove()
    })
    .catch(error => {
        if (error.code == 'auth/argument-error') {
            // token has expired
            return snap.ref.remove()
        } else {
            console.log("Error deleting user:", error);
        }
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

export {onCreate, deleteUser, authenticate}
