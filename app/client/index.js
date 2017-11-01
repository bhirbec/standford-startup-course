import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin';

import {init as initAuth} from './auth'
import {App} from './app'
import {Router} from 'react-router-dom'
import createBrowserHistory from 'history/createBrowserHistory'

// TODO: Is there a better way?
const history = createBrowserHistory()
Router.history = history

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

window.init = function () {
    // init Firebase
    firebase.initializeApp(window.config.fb)

    // must be called after firebase.initializeApp
    initAuth()

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

function renderApp(fbUser, isAdmin, redirectUri) {
    let el = document.getElementById('app')
    ReactDOM.render(<Router history={history}>
        <App fbUser={fbUser} isAdmin={isAdmin} />
    </Router>, el)
}
