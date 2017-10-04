const functions = require('firebase-functions');
const app = require('./app');
const mailer = require('./app/mailer');
const search = require('./app/search');
const liker = require('./app/liker');


exports.app = functions.https.onRequest(app.server);

exports.newInvite = functions.database.ref('invites/{inviteId}').onCreate((event) => {
    return mailer.notifyInvite(event.data)
});

// TODO: delete profile
exports.indexNewProfile = functions.database.ref('profile/{profileId}').onCreate((event) => {
    return search.index(event.data)
});

// TODO: this is triggered with forceRefresh in the client
exports.indexUpdatedProfile = functions.database.ref('profile/{profileId}').onUpdate((event) => {
    return search.index(event.data)
});

// notify review
exports.newReview = functions.database.ref('publicReviews/{revId}').onCreate((event) => {
    return mailer.notifyReview(event.data)
});

exports.updateReview = functions.database.ref('publicReviews/{revId}').onUpdate((event) => {
    return mailer.notifyReview(event.data)
});

// likes
exports.hashtagLike = functions.database.ref('likeQueue/{likeId}').onCreate((event) => {
    return liker.likeHasktag(event.data)
});
