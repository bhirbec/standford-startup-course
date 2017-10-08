import React from 'react'
// TODO: try https://github.com/krasimir/navigo instead of react router
import {Link, Redirect, Route, Switch} from 'react-router-dom'
import Avatar from 'material-ui/Avatar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'


import NoMatch from './error'
import InviteForm from './invite'
import Home from './home'
import {MyProfile, Profile} from './profile'
import {SearchBox, SearchResult} from './search'
import {ReviewFrom} from './review'
import Test from './test'
import {SignupComponent, LoginComponent, SignoutLink} from './auth'


let MenuItemStyle = {
    fontSize: 'inherit',
    fontFamily: 'inherit',
    color: '#000',
}


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {open: false}
    }

    toggleDrawer(e) {
        e.preventDefault()
        this.setState({open: !this.state.open})
    }

    componentWillReceiveProps() {
        this.setState({open: false})
    }

    render() {
        return <MuiThemeProvider>
            <div>
                <div className="drawer-gray-bg"
                    style={{'display': this.state.open ? 'block': 'none'}}
                    onClick={this.toggleDrawer.bind(this)} />

                <DrawerMenu
                    open={this.state.open}
                    fbUser={this.props.fbUser}
                    isAdmin={this.props.isAdmin}
                    toggleDrawer={this.toggleDrawer.bind(this)} />

                <DesktopNavbar
                    fbUser={this.props.fbUser}
                    isAdmin={this.props.isAdmin}
                    toggleDrawer={this.toggleDrawer.bind(this)} />

                <MobileNavbar
                    fbUser={this.props.fbUser}
                    isAdmin={this.props.isAdmin}
                    toggleDrawer={this.toggleDrawer.bind(this)} />

                <Switch>
                    <Route exact path="/" render={() => (
                        <Home />
                    )} />
                    <Route exact path="/signup" render={() => (
                        this.props.fbUser ? (
                            <Redirect to="/me" />
                        ) : (
                            <InnerLayout><SignupComponent /></InnerLayout>
                        )
                    )} />
                    <Route exact path="/login" render={() => (
                        this.props.fbUser ? (
                            <Redirect to="/me" />
                        ) : (
                            <InnerLayout><LoginComponent /></InnerLayout>
                        )
                    )} />
                    <Route path="/me" render={() => (
                        this.props.fbUser ? (
                            <InnerLayout>
                                {/* TODO: we could remove "me" parameter by merging
                                 /me and /in/:myprofileid */}
                                <MyProfile
                                    me={true}
                                    fbUser={this.props.fbUser}
                                    profileId={this.props.fbUser.uid} />
                            </InnerLayout>
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
                    <Route exact path="/in/:profileId" render={(data) => (
                        <InnerLayout>
                            <Profile
                                fbUser={this.props.fbUser}
                                profileId={data.match.params.profileId}
                                serverData={this.props.serverData} />
                        </InnerLayout>
                    )} />
                    <Route exact path="/in/:profileId/review/new" render={(data) => (
                        <InnerLayout>
                            <ReviewFrom
                                fbUser={this.props.fbUser}
                                profileId={data.match.params.profileId} />
                        </InnerLayout>
                    )} />
                    <Route exact path="/in/:profileId/review/:revId" render={(data) => (
                        <InnerLayout>
                            <ReviewFrom
                                fbUser={this.props.fbUser}
                                revId={data.match.params.revId}
                                profileId={data.match.params.profileId} />
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


class DesktopNavbar extends React.Component {
    render() {
        return <nav className="navbar navbar-default navbar-fixed-top desktop" role="navigation">
            <div className="container">
                <div className="navbar-header">
                    <a href="#" onClick={this.props.toggleDrawer} className="navbar-brand">
                        <i className="material-icons">menu</i>
                    </a>
                    <Link id="logo" className="navbar-brand" to={this.props.fbUser ? '/me' : '/'}>
                       <span>LETS</span>
                       <span className="main-color">RESUME</span>
                    </Link>
                    <Route path="/" render={(data) => (
                        <span id="search-box">
                            <SearchBox query={data.location.state ? data.location.state.query : ''} />
                            <i className="material-icons">search</i>
                        </span>
                    )} />
                </div>
                <div className="collapse navbar-collapse">
                    <ul className="nav navbar-nav navbar-right">
                        {this.props.fbUser && ([
                            <li key="to-invit-form">
                                <InviteForm profileId={this.props.fbUser.uid} />
                            </li>,
                            <li key="to-avatar">
                                <UserAvatar fbUser={this.props.fbUser} />
                            </li>,
                        ])}

                        {!this.props.fbUser && ([
                            <li key="to-login"><Link to='/login'>Log in</Link></li>,
                            <li key="to-signup"><Link to='/signup'>Sign Up</Link></li>,
                        ])}
                    </ul>
                </div>
            </div>
        </nav>
    }
}

class MobileNavbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {open: false}
    }

    componentWillReceiveProps(props) {
        let isSearch = window.location.pathname.substr(0, 7) == '/search'
        if (!isSearch) {
            this.setState({open: false})
        }
    }

    toggle(open, e) {
        e.preventDefault()
        this.setState({open: open})
    }

    render() {
        return <nav className="navbar navbar-default navbar-fixed-top mobile" role="navigation">
            <div className="container">
                <div className="navbar-header">
                    <a href="#" onClick={this.props.toggleDrawer} className="navbar-brand">
                        <i className="material-icons">menu</i>
                    </a>
                    {!this.state.open && (
                        <Link id="logo" className="navbar-brand" to={this.props.fbUser ? '/me' : '/'}>
                           <span>LETS</span>
                           <span className="main-color">RESUME</span>
                        </Link>
                    )}

                    {!this.state.open && (
                        <UserAvatar fbUser={this.props.fbUser} />
                    )}

                    <Route path="/" render={(data) => (
                        <span id="search-box">
                            {!this.state.open && (
                                <i className="material-icons" onClick={this.toggle.bind(this, true)}>
                                    search
                                </i>
                            )}
                            {this.state.open && (
                                <SearchBox query={data.location.state ? data.location.state.query : ''} />
                            )}
                            {this.state.open && (
                                <i className="material-icons" onClick={this.toggle.bind(this, false)}>
                                    highlight_off
                                </i>
                            )}
                        </span>
                    )} />
                </div>
            </div>
        </nav>
    }
}


class UserAvatar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {open: false}
    }

    toggle(e) {
        e.preventDefault();
        this.setState({open: true, anchorEl: e.currentTarget})
    }

    componentWillReceiveProps() {
        this.close()
    }

    close() {
        this.setState({open: false})
    }

    render() {
        let style = {
            backgroundColor: '#333',
            margin: 8,
        }

        if (this.props.fbUser) {
            return <div>
                <Avatar
                    size={34}
                    style={style}
                    className="avatar-icon"
                    onClick={this.toggle.bind(this)}>
                    <i className="material-icons">settings</i>
                </Avatar>

                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    onRequestClose={this.close.bind(this)}>
                    <div id="user-avatar">
                        <MenuItem key="to-signout" style={MenuItemStyle} disabled={true}>
                            {this.props.fbUser.email}
                        </MenuItem>
                        <MenuItem style={MenuItemStyle}>
                            <SignoutLink icon={
                                <i className="material-icons">eject</i>
                            } />
                        </MenuItem>
                    </div>
                </Popover>
            </div>
        } else {
            return null
        }
    }
}


class DrawerMenu extends React.Component {
    render() {
        return <Drawer open={this.props.open} containerClassName="drawer">
            <MenuItem style={MenuItemStyle}>
                <a href="#" onClick={this.props.toggleDrawer}>
                    <i className="material-icons">menu</i>
                </a>
            </MenuItem>
            <Link to='/'>
                <MenuItem style={MenuItemStyle}>
                    <i className="material-icons">home</i>Home
                </MenuItem>
            </Link>

            {!this.props.fbUser && ([
                <Link key="to-search" to='/search'>
                    <MenuItem style={MenuItemStyle}>
                        <i className="material-icons">search</i>Search
                    </MenuItem>
                </Link>,
                <Link key="to-login" to='/login'>
                    <MenuItem style={MenuItemStyle}>
                        <i className="material-icons">https</i>Log in
                    </MenuItem>
                </Link>,
                <Link key="to-signup" to='/signup'>
                    <MenuItem style={MenuItemStyle}>
                        <i className="material-icons">exit_to_app</i>Sign Up
                    </MenuItem>
                </Link>,
            ])}

            {this.props.fbUser && ([
                <Link key="to-me" to='/me'>
                    <MenuItem style={MenuItemStyle}>
                        <i className="material-icons">person</i>My Profile
                    </MenuItem>
                </Link>,
                <Link key="to-search" to='/search'>
                    <MenuItem style={MenuItemStyle}>
                        <i className="material-icons">search</i>Search
                    </MenuItem>
                </Link>,
                <MenuItem key="to-invit-form" style={MenuItemStyle}>
                    <InviteForm profileId={this.props.fbUser.uid} />
                </MenuItem>,
            ])}

            {this.props.isAdmin && (
                <MenuItem>
                    <Link to='/test'>
                        <i className="material-icons">warning</i>Test
                    </Link>
                </MenuItem>
            )}
        </Drawer>
    }
}


class InnerLayout extends React.Component {
    render() {
        return <div className="content-section-a">
            <div className="container">
                <div className="clearfix"></div>
                {this.props.children}
            </div>
        </div>
    }
}

export {App}
