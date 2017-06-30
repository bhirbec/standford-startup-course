import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'

import Me from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {signin, signout} from './signin'


class App extends React.Component {

    componentDidMount() {
        const fb = firebase.database()

        let authInstance = gapi.auth2.getAuthInstance()

        // Listen for changes to current user.
        authInstance.currentUser.listen((googleUser) => {
            console.log('GoogleUser loggin state: ', googleUser.isSignedIn())
            if (googleUser.isSignedIn()) {
                signin(googleUser)
            }
        });

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            let isLogged = firebaseUser != null
            console.log('Firebase loggin state: ', isLogged)

            if (!isLogged && authInstance.isSignedIn.get()) {
                gapi.auth2.getAuthInstance().signOut().then((error) => {
                    console.log('Signed out from Google.')
                    this.setState({isLogged: isLogged, user: firebaseUser})
                })
            } else {
                this.setState({isLogged: isLogged, user: firebaseUser})
            }
        })
    }

    render() {
        // TODO: dirty hack to render from server
        let state = this.state || this.props.serverData
        if (!state) {
            return <div>Loading app...</div>
        }

        return <div>
            <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
                <div className="container">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <Link to="/">
                            <a id="logo" className="navbar-brand" href="/">
                               <span>LETS</span>
                               <span className="salmon">RESUME</span>
                            </a>
                        </Link>
                    </div>
                   <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav navbar-right">
                            {state.isLogged && (
                                <li><a id="signout" href="#" onClick={signout}>Sign Out</a></li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <Route exact path="/" render={() => (
                state.isLogged ? (
                    <Redirect to="/me" />
                ) : (
                    <Home />
                )
            )}/>
            <Route exact path="/me" render={() => (
                state.isLogged ? (
                    <InnerLayout><Me user={state.user} /></InnerLayout>
                ) : (
                    <Redirect to="/" />
                )
            )}/>

            <Route exact path="/in/:id" render={(data) => (
                <InnerLayout>
                    <PublicProfile uid={data.match.params.id} serverData={this.props.serverData} />
                </InnerLayout>
            )}/>
        </div>
    }
}

class InnerLayout extends React.Component {
    render() {
        return <div className="container content-section-a">
            <div className="container">
                <div className="row">
                    <div className="clearfix"></div>
                    {this.props.children}
                </div>
            </div>
        </div>
    }
}

export {App}
