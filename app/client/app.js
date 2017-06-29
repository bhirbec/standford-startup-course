import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'

import Me from './me'
import Home from './home'
import {PublicProfile} from './publicprofile'
import {signout} from './signin'


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
                            {this.props.isLogged && (
                                <li><a id="signout" href="#" onClick={signout}>Sign Out</a></li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

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

            <Route exact path="/in/:id" render={(data) => (
                <PublicProfile uid={data.match.params.id} serverData={this.props.serverData} />
            )}/>
        </div>
    }
}

export {App}
