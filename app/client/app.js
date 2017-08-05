import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'

import {Me} from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {Search} from './search'
import {SignupComponent, LoginComponent, SignoutLink} from './auth'


class App extends React.Component {

    render() {
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
                            {this.props.fbUser && ([
                                idAdmin(this.props.fbUser.uid)?
                                    <li key="to-search"><Link to='/search'>Search</Link></li> : null
                                ,
                                <li key="to-signout"><SignoutLink /></li>
                            ])}
                            {!this.props.fbUser && ([
                                <li key="to-login"><Link to='/login'>Log in</Link></li>,
                                <li key="to-signup"><Link to='/signup'>Sign Up</Link></li>
                            ])}
                        </ul>
                    </div>
                </div>
            </nav>

            <Route exact path="/" render={() => (
                this.props.fbUser ? (
                    <Redirect to="/me" />
                ) : (
                    <Home />
                )
            )} />
            <Route exact path="/signup" render={() => (
                <InnerLayout><SignupComponent /></InnerLayout>
            )} />

            <Route exact path="/login" render={() => (
                <InnerLayout><LoginComponent /></InnerLayout>
            )} />

            <Route path="/me" render={() => (
                this.props.fbUser ? (
                    <InnerLayout><Me /></InnerLayout>
                ) : (
                    <Redirect to="/" />
                )
            )} />
            <Route exact path="/search" render={() => (
                this.props.fbUser ? (
                    <InnerLayout><Search /></InnerLayout>
                ) : (
                    <Redirect to="/" />
                )
            )} />
            <Route exact path="/in/:id" render={(data) => (
                <InnerLayout>
                    <PublicProfile
                        fbUser={this.props.fbUser}
                        profileId={data.match.params.id}
                        serverData={this.props.serverData} />
                </InnerLayout>
            )} />
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

function idAdmin(uid) {
    return {
        'lCxNpj5R0CMCrXZ9EnkSSUZwzYg2': true,
        'ujaAcjlu3gMPdtWrNq39x7HvzAT2': true,
        '5M7pXK3twXegXSaexip1ARA2qm02': true,
    }[uid] || false
}

export {App}
