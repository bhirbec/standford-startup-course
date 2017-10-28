import algoliasearch from 'algoliasearch'
import {fb, config} from './init'


var client = algoliasearch(config.algolia.applicationId, config.algolia.adminApiKey);
var profileIndex = client.initIndex('profile');


function index(snap) {
    let view = snap.val()

    let data = {
        firstname: view.identity.firstname,
        lastname: view.identity.lastname,
        photoURL: view.identity.photoURL,
        occupation: view.occupation,
        school: view.school,
        location: view.location,
        companies: Object.keys(view.companies || {}),
        hashtags: Object.keys(view.hashtags || {}),
        uid: view.identity.uid,
        objectID: view.identity.uid
    }

    profileIndex.saveObject(data, (err, content) => {
        if (err != null) {
            console.log(err)
        }
    })
}

function unindexProfile(uid) {
    return profileIndex.deleteObject(uid)
}


export {index, unindexProfile}
