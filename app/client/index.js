import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin';

import {App} from './app'
import {BrowserRouter} from 'react-router-dom'


// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

window.init = function () {
    firebase.initializeApp(window.fbConfig)

    firebase.auth().onAuthStateChanged((fbUser) => {
        let isLogged = fbUser != null
        console.log('Firebase loggin state: ', isLogged)

        if (!isLogged) {
            renderApp(fbUser, false)
        } else {
            firebase.database().ref('admin/' + fbUser.uid).once('value', (snap) => {
                renderApp(fbUser, snap.exists())
            })
        }
    })
}

function renderApp(fbUser, isAdmin) {
    let el = document.getElementById('app')
    ReactDOM.render(<BrowserRouter>
        <App fbUser={fbUser} isAdmin={isAdmin} />
    </BrowserRouter>, el)
}
