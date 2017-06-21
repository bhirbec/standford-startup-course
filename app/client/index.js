import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import {BrowserRouter as Router, Route, Redirect, Link} from 'react-router-dom'

import Me from './me'
import Home from './home'
import {signin, signout} from './signin'


firebase.initializeApp(window.fbConfig)
const fb = firebase.database()


// https://jedwatson.github.io/react-select/
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html
let loggedIn = false

class App extends React.Component {
    componentDidMount() {
        $('#signout').click(function(e) {
            signout()
            return false
        })

        this.updateSignoutLink()
    }

    componentDidUpdate() {
        this.updateSignoutLink()
    }

    updateSignoutLink() {
        if (this.props.isLogged) {
            $('#signout').css({display: 'block'})
        } else {
            $('#signout').css({display: 'none'})
        }
    }

    render() {
        return <Router>
            <div>
                <Route exact path="/" render={() => (
                    this.props.isLogged ? (
                        <Redirect to="/me" />
                    ) : (
                        <Home />
                    )
                )}/>
                <Route exact path="/me" render={() => (
                    this.props.isLogged ? (
                        <Me user={this.props.user} />
                    ) : (
                        <Redirect to="/" />
                    )
                )}/>
            </div>
        </Router>
    }
}

function redirectToHome() {
    if (window.location.pathname != '/') {
        window.location.href = '/'
    }
}

function init(resp) {
    // TODO: pass client_id via config
    gapi.auth2.init({
        client_id: '1017354286324-ulgeerbtd7h71v17dcs26ggo3durupoo.apps.googleusercontent.com',
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

        ReactDOM.render(<App isLogged={isLogged} user={firebaseUser} />, document.getElementById('app'));
    })
}

window.init = function () {
    console.log('Initializing app..')
    gapi.load('auth2', init)
}
