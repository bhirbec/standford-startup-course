const functions = require('firebase-functions');
const app = require('./app');
const mailer = require('./app/mailer');
const search = require('./app/search');


exports.app = functions.https.onRequest(app.server);

exports.mailer = functions.database.ref('queue/email/tasks/{taskid}').onCreate((event) => {
    return mailer.mailer(event.data)
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
    mailer.notifyReview(event.data)
});

exports.updateReview = functions.database.ref('publicReviews/{revId}').onUpdate((event) => {
    mailer.notifyReview(event.data)
});
