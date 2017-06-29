import React from 'react'
import ReactDOM from 'react-dom'

import {App} from './app'
import {BrowserRouter} from 'react-router-dom'



// https://jedwatson.github.io/react-select/
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html

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

    let el = document.getElementById('app')
    ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, el)
}
