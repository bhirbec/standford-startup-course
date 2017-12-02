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
    // deactivate GA on localhost
    if (window.location.href.substring(0, 16) == "http://localhost") {
        window.gtag = () => {}
    }

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
        <PageViewTracker>
            <App fbUser={fbUser} isAdmin={isAdmin} />
        </PageViewTracker>
    </Router>, el)
}


class PageViewTracker extends React.Component {
    trackPage(page) {
        gtag('config', window.config.googleAnalytics.trackingId, {'page_path': page})
    }

    componentDidMount() {
        gtag('js', new Date())
        this.page = window.location.pathname + window.location.search
        this.trackPage(this.page)
    }

    componentWillReceiveProps(nextProps) {
        let page = window.location.pathname + window.location.search

        if (this.page !== page) {
            this.trackPage(page)
            this.page = page
        }
    }

    render() {
        return <div>{this.props.children}</div>
    }
}
