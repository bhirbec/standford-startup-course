import {fb, config} from './server/init.js'
import app from './server/index.js'
import {notifyInvite, notifyReview} from './mailer'
import {index} from './search'
import {likeHasktag} from './liker'


 // start web server
app.listen(config.web.port, config.web.port.host, function () {
    console.log(`Starting web server on ${config.web.host}:${config.web.port}`)
})

// invite notification (uncomment to test)
// fb.ref('invites').limitToLast(1).on('child_added', notifyInvite)

// review notification (uncomment to test)
// fb.ref('publicReviews').limitToLast(1).on('child_added', notifyReview)

// likes (uncomment to test)
// fb.ref('likeQueue').limitToLast(1).on('child_added', likeHasktag)

// start indexer
console.info('Starging Algolia indexer')
fb.ref('profile').limitToLast(1).on('child_added', index)
fb.ref('profile').on('child_changed', index)
