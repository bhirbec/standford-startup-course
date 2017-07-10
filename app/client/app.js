import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'

import Me from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {SignupForm, LoginForm, SignoutLink} from './auth'


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isLogged: false, user: null}
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged((fbUser) => {
            let isLogged = fbUser != null
            console.log('Firebase loggin state: ', isLogged)
            this.setState({isLogged: isLogged, user: fbUser})
        })
    }

    render() {
        // TODO: dirty hack to render from server
        let state = this.state || this.props.serverData

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
                                <li><SignoutLink /></li>
                            )}
                            {!state.isLogged && ([
                                <li key="to-login"><Link to='/login'>Log in</Link></li>,
                                <li key="to-signup"><Link to='/signup'>Sign Up</Link></li>
                            ])}
                        </ul>
                    </div>
                </div>
            </nav>

            {state != null && ([
                <Route key='/' exact path="/" render={() => (
                    state.isLogged ? (
                        <Redirect to="/me" />
                    ) : (
                        <Home />
                    )
                )} />,
                <Route key='/signup' exact path="/signup" render={() => (
                    <InnerLayout><SignupForm /></InnerLayout>
                )} />,

                <Route key='/login' exact path="/login" render={() => (
                    <InnerLayout><LoginForm /></InnerLayout>
                )} />,

                <Route key='/me' exact path="/me" render={() => (
                    state.isLogged ? (
                        <InnerLayout><Me user={state.user} /></InnerLayout>
                    ) : (
                        <Redirect to="/" />
                    )
                )} />,
                <Route key='/in/:id' exact path="/in/:id" user={state.user} render={(data) => (
                    <InnerLayout>
                        <PublicProfile
                            user={state.user}
                            profileId={data.match.params.id}
                            serverData={this.props.serverData} />
                    </InnerLayout>
                )} />
            ])}
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
