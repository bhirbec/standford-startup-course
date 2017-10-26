import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'

import Form from './form'


let ui

function init() {
    ui = new firebaseui.auth.AuthUI(firebase.auth());
}

function initSocialSignup(redirectURI) {
  let uiConfig = {
    signInSuccessUrl: redirectURI,
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
  ui.start('#firebaseui-auth-container', uiConfig);
}


class Signup extends React.Component {
    onSubmit(data) {
        firebase.auth().createUserWithEmailAndPassword(data.email, data.pwd).catch((error) => {
            this.setState({error: error.message})
        })
    }

    componentDidMount() {
        initSocialSignup('/onboard')
    }

    componentWillReceiveProps() {
        initSocialSignup('/onboard')
    }

    render() {
        let state = this.state || {}
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



class Login extends React.Component {
    onSubmit(data) {
        firebase.auth().signInWithEmailAndPassword(data.email, data.pwd).catch((error) => {
            this.setState({error: error.message})
        })
    }

    componentDidMount() {
        initSocialSignup('/me')
    }

    componentWillReceiveProps() {
        initSocialSignup('/me')
    }

    render() {
        let state = this.state || {}
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
                </div>
            </Form>
        </div>
    }
}

export {Signup, SignoutLink, Login, init}
