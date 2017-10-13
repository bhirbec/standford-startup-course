import {fb, admin} from './init'

// TODO: catch fb error
function likeHasktag(snap) {
    let data = snap.val()

    return admin.auth().verifyIdToken(data.idToken).then(decodedToken => {
        let uid = decodedToken.uid;
        if (uid !== data.fromUid) {
            return null
        }

        fb.ref('profile')
            .child(data.toUid)
            .child('like')
            .child(data.hashtag)
            .child(data.fromUid)
            .set(data.value)

        return snap.ref.remove()
    })
}

export {likeHasktag}
