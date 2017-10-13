import {fb} from './init'
import {authenticate} from './user'

// TODO: catch fb error
function likeHasktag(snap) {
    let data = snap.val()

    return authenticate(data.idToken, data.fromUid).then(ok => {
        if (!ok) {
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
