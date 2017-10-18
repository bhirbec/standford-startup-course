import {fb, config} from './server/init'
import app from './server/app'
import {notifyInvite, notifyReview} from './server/mailer'
import {index} from './server/algolia-indexer'
import {likeHasktag} from './server/liker'
import {deleteUser} from './server/user'


 // start web server
app.listen(config.web.port, config.web.port.host, function () {
    console.log(`Starting web server on ${config.web.host}:${config.web.port}`)
})

// invite notification (uncomment to test)
// fb.ref('invites').limitToLast(1).on('child_added', notifyInvite)

// review notification (uncomment to test)
// fb.ref('publicReviews').limitToLast(1).on('child_added', notifyReview)

// likes (uncomment to test)
// fb.ref('queue/like').limitToLast(1).on('child_added', likeHasktag)

// deleteUser (uncomment to test)
// fb.ref('queue/deleteUser').limitToLast(1).on('child_added', deleteUser)

// start indexer
// console.info('Starging Algolia indexer')
// fb.ref('profile').limitToLast(1).on('child_added', index)
// fb.ref('profile').on('child_changed', index)
