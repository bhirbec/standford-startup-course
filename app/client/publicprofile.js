import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'

import {SetValue, FormData} from './form'
import {SignupForm, LoginForm, currentUser} from './auth'

// TODO: I'm not a fan of importing this from me.js
import {BaseProfile} from './me'


class PublicProfile extends BaseProfile {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentDidMount() {
        this.fetchProfileAndSetState(this.props.profileId)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.profileId != this.props.profileId) {
            if (this.fbRef) {
                this.fbRef.off()
            }
            this.fetchProfileAndSetState(nextProps.profileId)
        }
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }

        let fbUser = currentUser()
        let expIds = Object.keys(this.state.experience || [])
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            {fbUser && fbUser.uid == this.props.profileId && (
                <div>Edit your <Link to={'/me'}>profile</Link></div>
            )}

            <h1>{profileName}</h1>

            {expIds.map((expId) => {
                let reviews = []
                if (this.state.review) {
                    for (let revId in this.state.review[expId] || {}) {
                        reviews.push(this.state.review[expId][revId])
                    }
                }

                return <Experience
                    key={"exp-" + expId}
                    profileName={profileName}
                    profileId={this.props.profileId}
                    expId={expId}
                    exp={this.state.experience[expId]} />
            })}
        </div>
    }
}


class Experience extends React.Component {
    render() {
        let fbUser = currentUser()
        let exp = this.props.exp

        // TODO: sever side rendering fails with exp.reviews.map
        exp.reviews = exp.reviews || []

        return <div className="job-experience">
            <h3>{exp.companyName} - {exp.jobTitle}</h3>

            {(exp.jobStartDate || exp.jobEndDate) && (
                <div className="job-dates">
                    {exp.jobStartDate} to {exp.jobEndDate || 'present'}
                </div>
            )}

            <p className="job-description">
                {exp.jobDescription}
            </p>

            {exp.reviews.map((rev) => {
                return <Review
                    key={'review-' + rev.revId}
                    rev={rev} />
            })}

            {fbUser && fbUser.uid != this.props.profileId && (
                <NewReview
                    profileId={this.props.profileId}
                    profileName={this.props.profileName}
                    expId={this.props.expId}
                    jobTitle={exp.jobTitle} />
            )}
        </div>
    }
}

class Review extends React.Component {
    render() {
        let rev = this.props.rev

        if (rev.status != 'publish') {
            return null
        }

        return <div className="review">
            <div className="review-text">
                &ldquo;{rev.review}&rdquo;
            </div>
            <div className="review-info">
                <Link to={`/in/${rev.reviewer.uid}`}>
                    {rev.reviewer.firstname} {rev.reviewer.lastname}
                </Link> - {rev.UTCdate}
            </div>
        </div>
    }
}

class NewReview extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    save() {
        let $node = $(ReactDOM.findDOMNode(this))
        $node.find('.modal').modal('hide')
    }

    render() {
        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Add a Review
            </button>
            <Modal
                profileId={this.props.profileId}
                expId={this.props.expId}
                profileName={this.props.profileName}
                jobTitle={this.props.jobTitle}
                save={this.save.bind(this)}
                data={{}} />
        </div>
    }
}

class Modal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {mode: 'review'}
        this.fbUser = currentUser()
    }

    handleForm(e) {
        if (this.fbUser) {
            this.postReview(this.fbUser)
        } else {
            this.setState({mode: 'signup'})
        }
        e.preventDefault()
    }

    postReview(fbUser) {
        firebase.database().ref('profile').child(fbUser.uid + '/info').once('value', (snap) => {
            let info = snap.val()

            // TODO: do we have to denormalize the data for firstname and lastname?
            let data = {
                'reviewer': {
                    uid: fbUser.uid,
                    firstname: info.firstname,
                    lastname: info.lastname
                },
                expId: this.props.expId,
                review: this.state.review,
                UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
            }

            let ref = firebase.database().ref(`reviews/${this.props.profileId}`)
            ref.push().set(data, () => {
                this.props.save()
            })
        })
    }

    handleChange(event) {
        var state = {}
        state[event.target.name] = event.target.value
        this.setState(state);
    }

    changeMode(mode, e) {
        this.setState({mode: mode})
        e.preventDefault()
    }

    render() {
        let form = this[this.state.mode].bind(this)
        return <div className="modal fade" role="dialog">
            <div className="modal-dialog">{form()}</div>
        </div>
    }

    header(title) {
        return <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">&times;</button>
            <h3 className="modal-title">{title}</h3>
        </div>
    }

    review() {
        return <div className="modal-content">
            {this.header(`Review ${this.props.profileName} for position "${this.props.jobTitle}"`)}
            <form id='review-form' onSubmit={this.handleForm.bind(this)}>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="review">Enter your review</label>
                        <textarea id="review"
                            name="review"
                            rows={'4'}
                            value={this.state.review}
                            onChange={this.handleChange.bind(this)}
                            className="form-control"></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                        {this.fbUser == null  ? "Save & Sign Up" : "Save"}
                    </button>
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </form>
        </div>
    }

    signup() {
        return <div className="modal-content">
            {this.header('Sign up to post your review')}
            <div className="modal-body auth-form">
                <SignupForm resolve={this.postReview.bind(this)} />
                <div className="centered">
                    <span>Already on letsResume? </span>
                    <a href="#" onClick={this.changeMode.bind(this, 'login')}>Log in</a>
                </div>
            </div>
        </div>
    }

    login() {
        return <div className="modal-content">
            {this.header('Log in to post your review')}
            <div className="modal-body auth-form">
                <LoginForm resolve={this.postReview.bind(this)} />
                <div className="centered">
                    <span>New to letsResume? </span>
                    <a href="#" onClick={this.changeMode.bind(this, 'signup')}>Sign Up</a>
                </div>
            </div>
        </div>
    }
}

export {PublicProfile}
