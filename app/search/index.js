import algoliasearch from 'algoliasearch'
// TODO: move init in its own package?
import {fb, config} from '../server/init.js'


var client = algoliasearch(config.algolia.applicationId, config.algolia.adminApiKey);
var profileIndex = client.initIndex('profile');


function index(snap) {
    let info = snap.val().info

    let data = {
        firstname: info.firstname,
        lastname: info.lastname,
        uid: snap.key,
        objectID: snap.key
    }

    profileIndex.saveObject(data, (err, content) => {
        if (err != null) {
            console.log(err)
        }
    })
}

export {index}