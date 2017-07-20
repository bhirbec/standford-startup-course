import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'

import {SetValue, FormData} from './form'
import {SignupForm, LoginForm, currentUser} from './auth'


import {joinReviews, forceRefresh} from './me'


class PublicProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentDidMount() {
        this.fetchProfileAndSetState(this.props.profileId)
    }

    fetchProfileAndSetState(uid) {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        this.fbRef = fb.ref('profile').child(uid)

        this.fbRef.on('value', (snap) => {
            // TODO: understand why snap.val() is null when the user signs in for the first time
            let profile = snap.val()
            if (profile == null) {
                return
            }

            let reviews = {}
            let fbUser = currentUser()
            let publicRef = fb.ref('publicReviews').orderByChild("toUid").equalTo(uid)

            if (fbUser) {
                let pendingRef = fb.ref('pendingReviews').child(uid).child(fbUser.uid)

                pendingRef.once('value').then((snap) => {
                    snap.forEach((snap1) => {
                        reviews[snap1.key] = snap1.val()
                        reviews[snap1.key].status = 'pending'
                    })

                    return publicRef.once('value')
                }).then((snap) => {
                    snap.forEach((snap1) => {
                        reviews[snap1.key] = snap1.val()
                        reviews[snap1.key].status = 'public'
                    })

                    joinReviews(profile, reviews)
                    this.setState(profile)
                })
            } else {
                publicRef.once('value').then((snap) => {
                    snap.forEach((snap1) => {
                        reviews[snap1.key] = snap1.val()
                        reviews[snap1.key].status = 'public'
                    })

                    joinReviews(profile, reviews)
                    this.setState(profile)
                })
            }
        })
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
                    profileId={this.props.profileId}
                    profileName={this.props.profileName}
                    expId={this.props.expId}
                    jobTitle={exp.jobTitle}
                    rev={rev} />
            })}

            {(fbUser === null || fbUser.uid != this.props.profileId) && (
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
        let fbUser = currentUser()

        return <div className="review">
            <div className="review-text">
                &ldquo;{rev.review}&rdquo;
            </div>
            <div className="review-info">
                <Link to={`/in/${rev.fromUid}`}>
                    {rev.reviewer.firstname} {rev.reviewer.lastname}
                </Link>
                <span> - {rev.UTCdate}</span>
                <span> - {rev.status}</span>
            </div>
            {fbUser && fbUser.uid == rev.fromUid && rev.status == 'pending' && (
                <div className="review-buttons">
                    <NewReview
                        profileId={this.props.profileId}
                        profileName={this.props.profileName}
                        expId={this.props.expId}
                        jobTitle={this.props.jobTitle}
                        rev={rev} />
                </div>
            )}
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
                {this.props.rev ? 'Edit' : 'Write a Review'}
            </button>
            <Modal
                profileId={this.props.profileId}
                expId={this.props.expId}
                profileName={this.props.profileName}
                jobTitle={this.props.jobTitle}
                save={this.save.bind(this)}
                rev={this.props.rev} />
        </div>
    }
}

class Modal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {mode: 'review'}
        this.state.review = this.props.rev ? this.props.rev.review : ''
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
        let fb = firebase.database()
        let ref = fb.ref(`pendingReviews/${this.props.profileId}/${fbUser.uid}`)

        if (this.props.rev) {
            ref.child(this.props.rev.revId).update({
                review: this.state.review,
                UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
            }).then(() => {
                this.props.save()
                forceRefresh(this.props.profileId)
            })
            return
        }

        firebase.database().ref('profile').child(fbUser.uid + '/info').once('value', (snap) => {
            let info = snap.val()

            // TODO: do we have to denormalize the data for firstname and lastname?
            let data = {
                'toUid': this.props.profileId,
                'fromUid': fbUser.uid,
                'reviewer': {
                    firstname: info.firstname,
                    lastname: info.lastname
                },
                expId: this.props.expId,
                review: this.state.review,
                UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
            }

            ref.push().set(data, () => {
                this.props.save()
                forceRefresh(this.props.profileId)
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
