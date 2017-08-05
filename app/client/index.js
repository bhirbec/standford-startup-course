import React from 'react'
import ReactDOM from 'react-dom'

import {App} from './app'
import {BrowserRouter} from 'react-router-dom'


window.init = function () {
    gapi.load('auth2', init)
}

function init() {
    firebase.initializeApp(window.fbConfig)

    // TODO: pass client_id via config
    gapi.auth2.init({
        client_id: '1017354286324-oeh36r4lglt125tuarv18cdnisi2ljjv.apps.googleusercontent.com',
        fetch_basic_profile: false,
        scope: 'email profile'
    });

    firebase.auth().onAuthStateChanged((fbUser) => {
        let isLogged = fbUser != null
        console.log('Firebase loggin state: ', isLogged)
        let el = document.getElementById('app')
        ReactDOM.render(<BrowserRouter>
            <App isLogged={isLogged} fbUser={fbUser} />
        </BrowserRouter>, el)
    })
}
