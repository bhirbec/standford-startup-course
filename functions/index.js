const functions = require('firebase-functions');
const app = require('./app/server/app');
const mailer = require('./app/server/mailer');
const indexer = require('./app/server/algolia-indexer');
const liker = require('./app/server/liker');


exports.app = functions.https.onRequest(app);

exports.newInvite = functions.database.ref('invites/{inviteId}').onCreate((event) => {
    return mailer.notifyInvite(event.data)
});

// TODO: delete profile
exports.indexNewProfile = functions.database.ref('profile/{profileId}').onCreate((event) => {
    return indexer.index(event.data)
});

// TODO: this is triggered with forceRefresh in the client
exports.indexUpdatedProfile = functions.database.ref('profile/{profileId}').onUpdate((event) => {
    return indexer.index(event.data)
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
