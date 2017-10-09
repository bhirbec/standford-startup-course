import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'

import Form from './form'


class Signup extends React.Component {
    onSubmit(data) {
        let fb = firebase.database()

        if (data.firstname == "") {
            this.setState({error: "First Name can not be empty"})
            return
        }

        if (data.lastname == "") {
            this.setState({error: "Last Name can not be empty"})
            return
        }

        firebase.auth().createUserWithEmailAndPassword(data.email, data.pwd)
        .then((fbUser) => {
            data.uid = fbUser.uid
            delete data['pwd']
            return fb.ref('profile/' + fbUser.uid + '/info').set(data)
        }).catch((error) => {
            this.setState({error: error.message})
        })
    }

    render() {
        let state = this.state || {}
        return <div className="auth-form">
            <h1>Sign Up for LetsResume</h1>
            <Form onSubmit={this.onSubmit.bind(this)}>
                {state.error && (
                    <div className="form-error">{state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="firstname">First Name</label>
                    <input id="firstname"
                        type="text"
                        name="firstname"
                        className="form-control" />
                </div>
                <div className="form-group">
                    <label htmlFor="lastname">Last Name</label>
                    <input id="lastname"
                        type="text"
                        name="lastname"
                        className="form-control" />
                </div>
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
            <div className="centered">
                <span>Already on letsResume? </span>
                <Link to="/login">Log in</Link>
            </div>
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

    render() {
        let state = this.state || {}
        return <div className="auth-form">
            <h1>Log In to LetsResume</h1>
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
            <div className="centered">
                <span>New to letsResume? </span>
                <Link to="/signup">Sign Up</Link>
            </div>
        </div>

    }
}

export {Signup, SignoutLink, Login}
