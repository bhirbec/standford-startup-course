import React from 'react'
import ReactDOM from 'react-dom'

import {App} from './app'
import {signin} from './signin'
import {BrowserRouter} from 'react-router-dom'


firebase.initializeApp(window.fbConfig)
const fb = firebase.database()

// https://jedwatson.github.io/react-select/
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html

function redirectToHome() {
    if (window.location.pathname != '/') {
        window.location.href = '/'
    }
}

function init(resp) {
    // TODO: pass client_id via config
    gapi.auth2.init({
        client_id: '1017354286324-oeh36r4lglt125tuarv18cdnisi2ljjv.apps.googleusercontent.com',
        fetch_basic_profile: false,
        scope: 'email profile'
    });

    let authInstance = gapi.auth2.getAuthInstance()

    // Listen for changes to current user.
    authInstance.currentUser.listen(function(googleUser) {
        console.log('GoogleUser loggin state: ', googleUser.isSignedIn())
        if (googleUser.isSignedIn()) {
            signin(googleUser)
        }
    });

    firebase.auth().onAuthStateChanged(function(firebaseUser) {
        let isLogged = firebaseUser != null
        console.log('Firebase loggin state: ', isLogged)

        if (!isLogged) {
            if (authInstance.isSignedIn.get()) {
                gapi.auth2.getAuthInstance().signOut().then(function(error) {
                    console.log('Signed out from Google.')
                    redirectToHome()
                })
            } else {
                redirectToHome()
            }
        }

        let el = document.getElementById('app')

        ReactDOM.render(<BrowserRouter>
            <App isLogged={isLogged} user={firebaseUser} />
        </BrowserRouter>, el)
    })
}

window.init = function () {
    console.log('Initializing app..')
    gapi.load('auth2', init)
}
