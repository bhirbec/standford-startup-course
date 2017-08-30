import {fb, config} from './server/init.js'
import {server, mailer} from './index.js'
import {index} from './search'

 // start web server
server.listen(config.web.port, config.web.port.host, function () {
    console.log(`Starting web server on ${config.web.host}:${config.web.port}`)
})

// start email worker
console.info('Starging email queue')
fb.ref('queue/email/tasks').on('child_added', mailer)

// start indexer
console.info('Starging Algolia indexer')
fb.ref('profile').limitToLast(1).on('child_added', index)
fb.ref('profile').on('child_changed', index)
