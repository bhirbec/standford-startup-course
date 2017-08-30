const functions = require('firebase-functions');
const app = require('./app');
const search = require('./app/search')

exports.app = functions.https.onRequest(app.server);

exports.mailer = functions.database.ref('queue/email/tasks/{taskid}').onCreate((event) => {
    return app.mailer(event.data)
});

// TODO: delete profile
exports.indexNewProfile = functions.database.ref('profile/{profileId}').onCreate((event) => {
    return search.index(event.data)
});

exports.indexUpdatedProfile = functions.database.ref('profile/{profileId}').onUpdate((event) => {
    return search.index(event.data)
});
