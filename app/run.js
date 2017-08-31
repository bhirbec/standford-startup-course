import {fb, config} from './server/init.js'
import {server} from './index.js'
import {notifyInvite, notifyReview} from './mailer'
import {index} from './search'

 // start web server
server.listen(config.web.port, config.web.port.host, function () {
    console.log(`Starting web server on ${config.web.host}:${config.web.port}`)
})

// invite notification (uncomment to test)
// fb.ref('invites').limitToLast(1).on('child_added', notifyInvite)

// review notification (uncomment to test)
// fb.ref('publicReviews').limitToLast(1).on('child_added', notifyReview)

// start indexer
console.info('Starging Algolia indexer')
fb.ref('profile').limitToLast(1).on('child_added', index)
fb.ref('profile').on('child_changed', index)
