import {fb, config} from './server/init'
import app from './server/app'
import {notifyInvite} from './server/mailer'
import {index} from './server/algolia-indexer'
import {likeHasktag} from './server/liker'
import {deleteUser} from './server/user'
import {sendMessage} from './server/messager'


 // start web server
app.listen(config.web.port, config.web.port.host, function () {
    console.log(`Starting web server on ${config.web.host}:${config.web.port}`)
})

// invite notification (uncomment to test)
// fb.ref('invites').limitToLast(1).on('child_added', notifyInvite)

// likes (uncomment to test)
// fb.ref('queue/like').limitToLast(1).on('child_added', likeHasktag)

// message
// fb.ref('queue/message').limitToLast(1).on('child_added', sendMessage)

// start indexer
// console.info('Starging Algolia indexer')
// fb.ref('profile').limitToLast(1).on('child_added', index)
// fb.ref('profile').on('child_changed', index)
