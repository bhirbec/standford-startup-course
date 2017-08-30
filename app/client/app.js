import React from 'react'
// TODO: try https://github.com/krasimir/navigo instead of react router
import {Link, Redirect, Route, Switch} from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import NoMatch from './error'
import InviteForm from './invite'
import {Me} from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {SearchBox, SearchResult} from './search'
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
                            <Link id="logo" className="navbar-brand" to={this.props.fbUser ? '/me' : '/'}>
                               <span>LETS</span>
                               <span className="salmon">RESUME</span>
                            </Link>
                        </div>
                       <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <Route path="/" render={(data) => (
                                        <SearchBox query={data.location.state ? data.location.state.query : ''} />
                                    )} />
                                </li>

                                {this.props.fbUser && ([
                                    <li key="to-invit-form"><InviteForm profileId={this.props.fbUser.uid} /></li>,
                                    <li key="to-home"><Link to='/'>Home</Link></li>,
                                    <li key="to-me"><Link to='/me'>My Profile</Link></li>,
                                ])}

                                {this.props.isAdmin && ([
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

                <Switch>
                    <Route exact path="/" render={() => (
                        <Home />
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
                    <Route exact path="/search" render={(data) => (
                        <InnerLayout><SearchResult query={data.location.state ? data.location.state.query: ''} /></InnerLayout>
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
                    <Route render={(data) => (
                        <InnerLayout><NoMatch /></InnerLayout>
                    )}/>
                </Switch>
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
