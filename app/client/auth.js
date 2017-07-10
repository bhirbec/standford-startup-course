import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import {BaseForm} from './form'


class SignupForm extends BaseForm {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleForm(e) {
        let data = this.formData()
        let fb = firebase.database()

        firebase.auth().createUserWithEmailAndPassword(data.email, data.pwd)
        .then((fbUser) => {
            data.uid = fbUser.uid
            delete data['pwd']
            return fb.ref('profile/' + fbUser.uid + '/info').set(data)
        })
        .then((resp) => {
            this.setState({done: true})
        })
        .catch((error) => {
            console.log(error)
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        });

        e.preventDefault()
    }

    render() {
        if (this.state.done) {
            return <Redirect to="/me" />
        }

        return <div className="auth-form">
            <h1>Sign Up for LetsResume</h1>
            <form onSubmit={this.handleForm.bind(this)}>
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
                <div className="buttons">
                    <button type="submit" className="btn btn-success">Sign up</button>
                    <div>Already on letsResume? <Link to="/login">Log in</Link></div>
                </div>
            </form>
        </div>
    }
}
class SignoutLink extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    signout(e) {
        firebase.auth().signOut()
        .then(() => {
            this.setState({done: true})
        })
        .catch((error) => {
            console.log("An error occured while signing out of Firebase", error)
        });

        e.preventDefault()
    }

    render() {
        if (this.state.done) {
            return <Redirect to='/' />
        } else {
            return <a id="signout" href="#" onClick={this.signout.bind(this)}>Sign Out</a>
        }
    }
}

class LoginForm extends BaseForm {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleForm(e) {
        let data = this.formData()

        firebase.auth().signInWithEmailAndPassword(data.email, data.pwd)
        .then((fbUser) => {
            this.setState({done: true})
        })
        .catch(function(error) {
          // Handle Errors here.
          console.log(error)
          var errorCode = error.code;
          var errorMessage = error.message;
        })

        e.preventDefault()
    }

    render() {
        if (this.state.done) {
            return <Redirect to="/me" />
        }

        return <div className="auth-form">
            <h1>Log In to LetsResume</h1>
            <form onSubmit={this.handleForm.bind(this)}>
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
                <div className="buttons">
                    <button type="submit" className="btn btn-success">Log In</button>
                    <div>New to letsResume? <Link to="/signup">Sign Up</Link></div>
                </div>
            </form>
        </div>
    }
}

export {SignupForm, SignoutLink, LoginForm}
