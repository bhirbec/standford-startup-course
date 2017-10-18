import {fb} from './init'
import {authenticate} from './user'


function likeHasktag(snap) {
    let data = snap.val()

    return authenticate(data.idToken, data.fromUid).then(ok => {
        if (!ok) {
            Throw('Authentication failed')
        } else {
            return fb.ref('profile')
                .child(data.toUid)
                .child('like')
                .child(data.hashtag)
                .child(data.fromUid)
                .set(data.value)
        }
    }).then(() => {
        return snap.ref.remove()
    })
}

export {likeHasktag}
