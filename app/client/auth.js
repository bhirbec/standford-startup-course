import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import Form from './form'
import {pending} from './model'


let ui

function init() {
    ui = new firebaseui.auth.AuthUI(firebase.auth());
}

class AuthBase extends React.Component {
    componentDidMount() {
        let uiConfig = {
            signInSuccessUrl: '/logged-in',
            signInFlow: 'redirect',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                // firebase.auth.GithubAuthProvider.PROVIDER_ID,
                // firebase.auth.EmailAuthProvider.PROVIDER_ID,
                // firebase.auth.PhoneAuthProvider.PROVIDER_ID
            ],
        };

        // Initialize the FirebaseUI Widget using Firebase.
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig)
    }

    componentWillReceiveProps(props) {
        // user has logged out
        if (!props.fbUser) {
            this.setState({redirect: '/'})
        } else if (this.emailSignup) {
            // this is triggered when the user has logged in with an email
            loggedin(props.fbUser).then(redirectURI => {
                this.setState({redirect: redirectURI})
            })
        }
    }
}


class Signup extends AuthBase {
    onSubmit(data) {
        firebase.auth().createUserWithEmailAndPassword(data.email, data.pwd)
        .then(() => {
            this.emailSignup = true
        })
        .catch((error) => {
            this.setState({error: error.message})
        })
    }

    render() {
        let state = this.state || {}

        if (state.redirect) {
            return <Redirect to={state.redirect} />
        }

        return <div className="auth-form">
            <h1>Sign Up for LetsResume</h1>

            <div className="question">
                <span>Already on letsResume? </span>
                <Link to="/login">Log in</Link>
            </div>

            <div id="firebaseui-auth-container"></div>
            <div className="or"><span>OR</span></div>

            <Form onSubmit={this.onSubmit.bind(this)}>
                {state.error && (
                    <div className="form-error">{state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email"
                        type="text"
                        name="email"
                        className="form-control" />
                </div>
                <div className="form-group">
                    <label htmlFor="pwd">Password</label>
                    <input id="pwd"
                        type="password"
                        name="pwd"
                        className="form-control" />
                </div>
                <div className="centered">
                    <button type="submit" className="btn btn-success">Sign up</button>
                </div>
            </Form>
        </div>
    }
}


class Login extends AuthBase {
    onSubmit(data) {
        firebase.auth().signInWithEmailAndPassword(data.email, data.pwd)
        .then(() => {
            this.emailSignup = true
        })
        .catch((error) => {
            this.setState({error: error.message})
        })
    }

    render() {
        let state = this.state || {}

        if (state.redirect) {
            return <Redirect to={state.redirect} />
        }

        return <div className="auth-form">
            <h1>Log In to LetsResume</h1>

            <div className="question">
                <span>New to letsResume? </span>
                <Link to="/signup">Sign Up</Link>
            </div>

            <div id="firebaseui-auth-container"></div>
            <div className="or"><span>OR</span></div>

            <Form onSubmit={this.onSubmit.bind(this)}>
                {state.error && (
                    <div className="form-error">{state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email"
                        type="text"
                        name="email"
                        className="form-control" />
                </div>
                <div className="form-group">
                    <label htmlFor="pwd">Password</label>
                    <input id="pwd"
                        type="password"
                        name="pwd"
                        className="form-control" />
                </div>
                <div className="centered">
                    <button type="submit" className="btn btn-success">Log In</button>
                    <Link to="/password-reset">Forgot password?</Link>
                </div>
            </Form>
        </div>
    }
}


class Loggedin extends React.Component {
    componentDidMount() {
        loggedin(this.props.fbUser).then(redirectURI => {
            this.setState({redirect: redirectURI})
        })
    }

    render() {
        if (this.state == null) {
            return null
        } else {
            return <Redirect to={this.state.redirect} />
        }
    }
}


function loggedin(fbUser) {
    let fb = firebase.database()
    let ref = fb.ref('profile').child(fbUser.uid).child('onboarded')

    return ref.once('value').then(snap => {
        let onboarded = snap.val() || false

        if (!onboarded) {
            gtag('event', 'onboarding-start', {
                'event_category': 'onboarding',
                'event_label': `Onboarding start`,
            })
            return '/onboard'
        } else {
            /* we may have stored a "like/review" from an anonymous user. If so,
            the user has now signed up and we can save the data. We redirect to
            the profile receiving the "like/review" */
            let redirectURI = pending.flush(fbUser)
            return redirectURI || '/me'
        }
    })
}


class SignoutLink extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    signout(e) {
        firebase.auth().signOut().catch((error) => {
            console.log("An error occured while signing out of Firebase", error)
        });

        e.preventDefault()
    }

    render() {
        return <a id="signout" href="#" onClick={this.signout.bind(this)}>
            {this.props.icon}
            Sign Out
        </a>
    }
}

class PasswordReset extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onSubmit(formData) {
        if (!formData.email) {
            this.setState({error: `"email" field can not be empty.`})
            return
        }

        firebase.auth().sendPasswordResetEmail(formData.email).then(() => {
            this.setState({error: null, ack: true})
        }).catch(error => {
            console.log(error)
            this.setState({error: error.message})
        })
    }

    render() {
        return <div className="auth-form">
            <h1>Password Reset</h1>

            {this.state.ack && (
                <div className="centered">
                    <p>Please check your email and click the secure link.</p>
                    <Link to="/login">Back to login</Link>
                </div>
            )}

            {!this.state.ack && (
                <Form onSubmit={this.onSubmit.bind(this)}>
                    {this.state.error && (
                        <div className="form-error">{this.state.error}</div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Please enter your email</label>
                        <input id="email"
                            name="email"
                            type="text"
                            className="form-control" />
                    </div>

                    <div className="centered">
                        <button type="submit" className="btn btn-success">Send</button>
                    </div>
                </Form>
            )}
        </div>
    }
}


export {Signup, SignoutLink, Login, Loggedin, PasswordReset, init}
