const functions = require('firebase-functions');
const app = require('./app');

exports.app = functions.https.onRequest(app.server);

exports.mailer = functions.database.ref('queue/email/tasks/{taskid}').onCreate((event) => {
    return app.mailer(event.data)
});
