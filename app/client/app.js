import React from 'react'
// TODO: try https://github.com/krasimir/navigo instead of react router
import {Link, Redirect, Route, Switch} from 'react-router-dom'
import Avatar from 'material-ui/Avatar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover';
import Snackbar from 'material-ui/Snackbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import NoMatch from './error'
import InviteForm from './invite'
import Home from './home'
import ContactForm from './contact-form'
import {MyProfile, Profile} from './profile'
import ProfileForm from './profile-form'
import {SearchBox, SearchResult} from './search'
import {ReviewFrom} from './review'
import Test from './test'
import {Signup, Login, SignoutLink, Loggedin, PasswordReset} from './auth'


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

                <MobileNavbar
                    fbUser={this.props.fbUser}
                    isAdmin={this.props.isAdmin}
                    toggleDrawer={this.toggleDrawer.bind(this)} />

                <Switch>
                    <Route exact path="/" render={() => (
                        <Home />
                    )} />
                    <Route exact path="/signup" render={() => (
                        <InnerLayout>
                            <Signup fbUser={this.props.fbUser} redirectUri={this.props.redirectUri} />
                        </InnerLayout>
                    )} />
                    <Route exact path="/login" render={() => (
                        <InnerLayout>
                            <Login fbUser={this.props.fbUser} />
                        </InnerLayout>
                    )} />
                    <Route exact path="/logged-in" render={() => (
                        <InnerLayout>
                            <Loggedin fbUser={this.props.fbUser} />
                        </InnerLayout>
                    )} />
                    <Route exact path="/password-reset" render={() => (
                        <InnerLayout><PasswordReset /></InnerLayout>
                    )} />
                    <Route exact path="/onboard" render={(data) => (
                        this.props.fbUser ? (
                            <InnerLayout>
                                <ProfileForm
                                    redirectUri={getQueryVariable(data.location.search, 'redirectUri')}
                                    fbUser={this.props.fbUser}
                                    profileId={this.props.fbUser.uid}
                                    onboard={true} />
                            </InnerLayout>
                        ) : (
                            <Redirect to="/" />
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

                    <Route path="/contact/:profileId" render={(data) => (
                        <InnerLayout>
                            {this.props.fbUser ? (
                                <ContactForm
                                    fbUser={this.props.fbUser}
                                    profileId={data.match.params.profileId} />
                            ) : (
                                <Redirect to="/signup" />
                            )}
                        </InnerLayout>
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
                    <Route exact path="/account/delete" render={(data) => (
                        <InnerLayout>
                            <DeleteAccount fbUser={this.props.fbUser} />
                        </InnerLayout>
                    )} />
                    <Route render={(data) => (
                        <InnerLayout><NoMatch /></InnerLayout>
                    )}/>
                </Switch>
                <Flasher fbUser={this.props.fbUser} />
            </div>
        </MuiThemeProvider>
    }
}


class MobileNavbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {open: false}
    }

    componentDidMount() {
        let isSearch = window.location.pathname.substr(0, 7) == '/search'
        this.setState({open: isSearch})
    }

    componentWillReceiveProps() {
        let isSearch = window.location.pathname.substr(0, 7) == '/search'
        this.setState({open: isSearch})
    }

    toggle(open, e) {
        e.preventDefault()
        this.setState({open: open})
    }

    render() {
        if (!this.state.open) {
            return <nav key="nav-bar" id="nav" role="navigation">
                <div id="left-nav" className="clearfix">
                    <a id="menu-icon" href="#" onClick={this.props.toggleDrawer}>
                        <i className="material-icons">menu</i>
                    </a>
                    <Link id="logo" to={this.props.fbUser ? '/me' : '/'}>
                       <span className="lets">LETS</span>
                       <span className="main-color">RESUME</span>
                    </Link>
                </div>
                <div id="right-nav" className="clearfix">
                    {this.props.fbUser && (
                        <UserAvatar fbUser={this.props.fbUser} />
                    )}
                    {!this.props.fbUser && (
                        <Link to="/signup">Sign up</Link>
                    )}
                    {!this.props.fbUser && (
                        <Link to='/login'>Log in</Link>
                    )}
                    <i id="open-search" className="material-icons" onClick={this.toggle.bind(this, true)}>
                        search
                    </i>
                </div>
            </nav>
        } else {
            return <nav key="nav-bar" id="nav" role="navigation">
                <Route path="/" render={(data) => (
                    <span id="search-box">
                        <SearchBox query={data.location.state ? data.location.state.query : ''} />
                        <i className="material-icons search-icon" onClick={this.toggle.bind(this, true)}>
                            search
                        </i>
                        <i className="material-icons close-search" onClick={this.toggle.bind(this, false)}>
                            highlight_off
                        </i>
                    </span>
                )} />
            </nav>
        }
    }
}


class UserAvatar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {open: false, identity: null}
    }

    toggle(e) {
        e.preventDefault();
        this.setState({open: true, anchorEl: e.currentTarget})
    }

    componentDidMount() {
        this.ref = firebase.database().ref(`profile/${this.props.fbUser.uid}/view/identity`)
        this.ref.on('value', snap => {
            this.setState({identity: snap.val()})
        })
    }

    componentWillunmount() {
        this.ref.off()
    }

    componentWillReceiveProps() {
        this.close()
    }

    close() {
        this.setState({open: false})
    }

    render() {
        if (!this.state.identity) {
            return null
        }

        let style = {margin: 8}
        let photoURL = this.state.identity.photoURL

        return <div>
            {this.state.redirectUri && (
                <Redirect to={this.state.redirectUri} />
            )}

            {photoURL && (
                <Avatar
                    size={35}
                    style={style}
                    className="avatar-icon"
                    onClick={this.toggle.bind(this)}
                    src={photoURL}>
                </Avatar>
            )}

            {!photoURL && (
                <Avatar
                    size={35}
                    style={style}
                    className="avatar-icon"
                    onClick={this.toggle.bind(this)}>

                    {this.state.identity.firstname ?
                        this.state.identity.firstname.charAt(0).toUpperCase()
                        :
                        <i className="material-icons" style={{fontSize: 25}}>person</i>
                    }
                </Avatar>
            )}

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
                    <MenuItem style={MenuItemStyle}>
                        <Link to='/account/delete'>
                            <i className="material-icons">delete_forever</i>
                            Delete Account
                        </Link>
                    </MenuItem>
                </div>
            </Popover>
        </div>
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


class DeleteAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {step: 1}
    }

    deleteUser() {
        this.props.fbUser.delete().then((resp) => {
            this.setState({'step': 2})
        })
        .catch(error => {
            console.log(error)
            this.setState({error: error})
        })
    }

    render() {
        if (this.state.step == 1) {
            return <div>
                <h1>You are about to delete your account</h1>

                <p>
                    By clicking the button here below you acknowledge that the following
                    data will be deleted:
                </p>

                <ul>
                    <li>Your user account with your email</li>
                    <li>Your profile</li>
                    <li>Reviews other users wrote for you</li>
                    <li>Reviews you wrote for other users</li>
                </ul>

                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}

                <button
                    type="button"
                    className="btn btn-danger delete-account"
                    onClick={this.deleteUser.bind(this)}>Delete Your Account</button>
            </div>
        }

        if (this.state.step == 2) {
            return <div>
                <h1>Your account has been deleted</h1>
                <p>Hope to see you again soon.</p>
                <Link to='/'>Back to home page</Link>
            </div>
        }
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


class Flasher extends React.Component {
    componentDidMount() {
        this.listen(this.props.fbUser)
    }

    componentWillReceiveProps(nextProps) {
        this.listen(nextProps.fbUser)
    }

    componentWillunmount() {
        this.stop()
    }

    listen(fbUser) {
        this.stop()

        if (fbUser) {
            let fb = firebase.database()
            this.flashRef = fb.ref('profile').child(fbUser.uid).child('flash')

            this.flashRef.on('child_added', snap => {
                this.setState({flash: snap.val()})
                snap.ref.remove()
            })
        }
    }

    stop() {
        if (this.flashRef) {
            this.flashRef.off()
        }
    }

    handleSnackbarClose() {
        this.setState({flash: null})
    }

    render() {
        return <Snackbar
            open={Boolean(this.state && this.state.flash)}
            message={this.state ? (this.state.flash || '') : ''}
            autoHideDuration={5000}
            className='snack'
            onRequestClose={this.handleSnackbarClose.bind(this)} />
    }
}


function getQueryVariable(query, variable) {
    query = query.substring(1)
    let vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split('=')
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1])
        }
    }
    return ""
}


export {App}
