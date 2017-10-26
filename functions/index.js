const functions = require('firebase-functions');

const app = require('./app/server/app');
const indexer = require('./app/server/algolia-indexer');
const liker = require('./app/server/liker');
const mailer = require('./app/server/mailer');
const messager = require('./app/server/messager');
const user = require('./app/server/user');


exports.app = functions.https.onRequest(app);

exports.newInvite = functions.database.ref('invites/{inviteId}').onCreate((event) => {
    return mailer.notifyInvite(event.data)
});

// TODO: delete profile
exports.indexNewProfile = functions.database.ref('profile/{profileId}/view').onCreate((event) => {
    return indexer.index(event.data)
});

// This is triggered each time a profile change
exports.indexUpdatedProfile = functions.database.ref('profile/{profileId}/view').onUpdate((event) => {
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
exports.hashtagLike = functions.database.ref('queue/like/{likeId}').onCreate((event) => {
    return liker.likeHasktag(event.data)
});

// send Message
exports.sendMessage = functions.database.ref('queue/message/{messageId}').onCreate((event) => {
    return messager.sendMessage(event.data)
});

// user
exports.onCreateUser = functions.auth.user().onCreate(user.onCreate)
exports.onDeleteUser = functions.auth.user().onDelete(user.onDelete)
