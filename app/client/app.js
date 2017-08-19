import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import InviteForm from './invite'
import {Me} from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {Search} from './search'
import Test from './test'
import {SignupComponent, LoginComponent, SignoutLink} from './auth'


class App extends React.Component {

    render() {
        return <MuiThemeProvider>
            <div>
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
                                {this.props.fbUser && (
                                    <li><InviteForm profileId={this.props.fbUser.uid} /></li>
                                )}

                                {this.props.isAdmin && ([
                                    <li key="to-search"><Link to='/search'>Search</Link></li>,
                                    <li key="to-test"><Link to='/test'>Test</Link></li>
                                ])}

                                {this.props.fbUser && (
                                    <li key="to-signout"><SignoutLink /></li>
                                )}
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
                        <InnerLayout><Me fbUser={this.props.fbUser} /></InnerLayout>
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
                <Route exact path="/test" render={() => (
                    this.props.fbUser ? (
                        <InnerLayout><Test fbUser={this.props.fbUser} /></InnerLayout>
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
        </MuiThemeProvider>
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
