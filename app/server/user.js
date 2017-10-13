import {admin, fb} from './init'
import {unindexProfile} from './algolia-indexer'

// TODO: remove reviews
// TODO: send email
function deleteUser(snap) {
    let data = snap.val()

    authenticate(data.idToken, data.uid).then(ok => {
        if (!ok) {
            Throw('Authenticaion failed')
        } else {
            return admin.auth().deleteUser(data.uid)
        }
    }).then(() => {
        console.log("Successfully deleted user")
        return fb.ref('profile').child(data.uid).remove()
    }).then((snap) => {
        console.log("Successfully remove user reviews")
        return unindexProfile(data.uid)
    }).then(() => {
        console.log("Successfully remove user from Algolia index");
        return snap.ref.remove();
    }).catch(error => {
        console.log("Error deleting user:", error);
    })
}


function authenticate(idToken, uid) {
    return admin.auth().verifyIdToken(idToken).then(decodedToken => {
        let expectedUid = decodedToken.uid;
        return uid === expectedUid
    })
}

export {deleteUser, authenticate}
