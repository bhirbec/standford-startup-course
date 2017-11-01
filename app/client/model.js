import Cookies from 'universal-cookie';


function postReview(fbUser, profileId, review) {
    let fb = firebase.database()

    return fb.ref('profile').child(fbUser.uid).child('reviewsSent').child(profileId).push().set({
        review: review,
        UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
    })
}


function postHashtagLike(fbUser, profileId, hashtag, value) {
    return fbUser.getIdToken().then(idToken => {
        let fb = firebase.database()
        return fb.ref('queue/like').push().set({
            toUid: profileId,
            fromUid: fbUser.uid,
            idToken: idToken,
            hashtag: hashtag,
            value: value
        })
    })
}


const pending = {
    stageReview: (profileId, review) => {
        let cookies = new Cookies()
        let data = {'func': 'postReview', profileId: profileId, 'review': review}
        cookies.set('pending', data, { path: '/', maxAge: 10*60})
    },

    stageHashtagLike: (profileId, hashtag, value) => {
        let cookies = new Cookies()
        let data = {'func': 'postHashtagLike', 'profileId': profileId, 'hashtag': hashtag, 'value': value}
        cookies.set('pending', data, { path: '/', maxAge: 10*60})
    },

    flush: (fbUser) => {
        let cookies = new Cookies()
        let data = cookies.get('pending')

        if (!data) {
            return null
        }

        if (data.func == 'postReview') {
            postReview(fbUser, data.profileId, data.review)
            cookies.remove('pending')
            return `/in/${data.profileId}`
        }

        if (data.func == 'postHashtagLike') {
            postHashtagLike(fbUser, data.profileId, data.hashtag, data.value)
            cookies.remove('pending')
            return `/in/${data.profileId}`
        }

        return null
    }
}


export {postReview, postHashtagLike, pending}
