const func = require('firebase-functions');

const app = require('./app/server/app');
const indexer = require('./app/server/algolia-indexer');
const liker = require('./app/server/liker');
const mailer = require('./app/server/mailer');
const messager = require('./app/server/messager');
const profile = require('./app/server/profile');
const user = require('./app/server/user');
const db = func.database

exports.app = func.https.onRequest(app);

exports.newInvite = db.ref('invites/{inviteId}').onCreate(e => {
    return mailer.notifyInvite(e.data)
});

// TODO: delete profile
exports.indexNewProfile = db.ref('profile/{profileId}/view').onCreate(e => {
    return indexer.index(e.data)
});

// This is triggered each time a profile change
exports.indexUpdatedProfile = db.ref('profile/{profileId}/view').onUpdate(e => {
    return indexer.index(e.data)
});

exports.onIdentityUpdated = db.ref('profile/{profileId}/view/identity').onUpdate(e => {
    return profile.onIdentityUpdated(e.data.val())
});

// Review
exports.newReview = db.ref('profile/{fromUid}/reviewsSent/{toUid}/{revId}').onCreate(e => {
    return profile.onReviewUpdated(e.params.fromUid, e.params.toUid, e.params.revId, e.data.val())
});

exports.udpateReview = db.ref('profile/{fromUid}/reviewsSent/{toUid}/{revId}').onUpdate(e => {
    return profile.onReviewUpdated(e.params.fromUid, e.params.toUid, e.params.revId, e.data.val())
});

exports.deleteReview = db.ref('profile/{fromUid}/reviewsSent/{toUid}/{revId}').onDelete(e => {
    return profile.onReviewDeleted(e.params.toUid, e.params.revId)
});

// likes
exports.hashtagLike = db.ref('queue/like/{likeId}').onCreate(e => {
    return liker.likeHasktag(e.data)
});

// send Message
exports.sendMessage = db.ref('queue/message/{messageId}').onCreate(e => {
    return messager.sendMessage(e.data)
});

// user
exports.onCreateUser = func.auth.user().onCreate(user.onCreate)
exports.onDeleteUser = func.auth.user().onDelete(user.onDelete)
