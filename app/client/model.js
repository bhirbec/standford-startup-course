
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


function pendingData() {
    this.pendingReview = null
    this.pendingHashlike = null
}

pendingData.prototype = {
    stageReview: function (profileId, review) {
        this.pendingReview = {'profileId': profileId, 'review': review}
    },

    stageHashtagLike: function (profileId, hashtag, value) {
        this.pendingHashlike = {'profileId': profileId, 'hashtag': hashtag, 'value': value}
    },

    flush: function (fbUser) {
        let p = this.pendingReview
        if (p) {
            postReview(fbUser, p.profileId, p.review)
            this.pendingReview = null;
            return `/in/${p.profileId}`

        }

        p = this.pendingHashlike
        if (p) {
            postHashtagLike(fbUser, p.profileId, p.hashtag, p.value)
            this.pendingHashlike = null;
            return `/in/${p.profileId}`
        }

        return null
    }
}

let pending = new pendingData()

export {postReview, postHashtagLike, pending}
