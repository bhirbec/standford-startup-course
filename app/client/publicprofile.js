import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import Dialog from 'material-ui/Dialog';

import {SignupForm, LoginForm} from './auth'


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
            let updateReviews = (snap1, status) => {
                reviews[snap1.key] = snap1.val()
                reviews[snap1.key].status = status
            }

            let fbUser = this.props.fbUser
            let publicRef = fb.ref('publicReviews').orderByChild("toUid").equalTo(uid)
            let pr

            if (fbUser) {
                let pendingRef = fb.ref('pendingReviews').child(uid).child(fbUser.uid)
                pr = pendingRef.once('value').then((snap) => {
                    snap.forEach((snap1) => { updateReviews(snap1, 'pending') })
                    return publicRef.once('value')
                })
            } else {
                pr = publicRef.once('value')
            }

            pr.then((snap) => {
                snap.forEach((snap1) => { updateReviews(snap1, 'public') })
                joinReviews(profile, reviews)
                this.setState(profile)
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.fbRef) {
            this.fbRef.off()
        }
        this.fetchProfileAndSetState(nextProps.profileId)
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }

        let fbUser = this.props.fbUser
        let expIds = Object.keys(this.state.experience || [])
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            {fbUser && fbUser.uid == this.props.profileId && (
                <div>Edit your <Link to={'/me'}>profile</Link></div>
            )}

            <h1>{profileName}</h1>

            {expIds.map((expId) => {
                return <Experience
                    key={"exp-" + expId}
                    fbUser={fbUser}
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
        let fbUser = this.props.fbUser
        let exp = this.props.exp

        // TODO: sever side rendering fails with exp.reviews.map
        exp.reviews = exp.reviews || []

        let context = {
            fbUser: fbUser,
            profileId: this.props.profileId,
            profileName: this.props.profileName,
            expId: this.props.expId,
            jobTitle: exp.jobTitle,
        }

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
                return <Review key={'review-' + rev.revId} rev={rev} {...context} />
            })}

            {(fbUser === null || fbUser.uid != this.props.profileId) && (
                <ReviewFrom {...context} />
            )}
        </div>
    }
}

class Review extends React.Component {
    render() {
        let rev = this.props.rev
        let fbUser = this.props.fbUser

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
                    <ReviewFrom {...this.props} />
                </div>
            )}
        </div>
    }
}

class ReviewFrom extends React.Component {
    constructor(props) {
        super(props)
        this.state = {mode: 'review', open: false}
        this.state.review = this.props.rev ? this.props.rev.review : ''
    }

    handleOpen() {
        this.setState({open: true, mode: 'review'})
    }

    handleClose() {
        this.setState({open: false})
    }

    /* This is called when the user signs up */
    componentWillReceiveProps(props) {
        // TODO: this get triggers for all existing reviews... resulting
        // in permissions denied.
        let hasLoggedIn = this.props.fbUser == null && props.fbUser != null
        if (hasLoggedIn) {
            this.postReview(props.fbUser)
        }
    }

    postReview(fbUser) {
        let pr
        let fb = firebase.database()
        let ref = fb.ref(`pendingReviews/${this.props.profileId}/${fbUser.uid}`)

        if (this.props.rev) {
            pr = this.updateReview(ref)
        } else {
            pr = this.createReview(ref, fbUser)
        }

        pr.then(() => {
            this.setState({open: false})
            forceRefresh(this.props.profileId)
        })
    }

    updateReview(ref) {
        return ref.child(this.props.rev.revId).update({
            review: this.state.review,
            UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
        })
    }

    createReview(ref, fbUser) {
        return firebase.database().ref('profile').child(fbUser.uid + '/info').once('value', (snap) => {
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

            return ref.push().set(data)
        })
    }

    handleSubmit(e) {
        e.preventDefault()
        if (this.state.review == '') {
            this.setState({error: 'Review can not be empty.', 'mode': 'review'})
        } else {
            this.setState({'error': null})
            if (this.props.fbUser) {
                this.postReview(this.props.fbUser)
            } else {
                this.setState({mode: 'signup'})
            }
        }
    }

    handleChange(event) {
        var state = {}
        state[event.target.name] = event.target.value
        this.setState(state);
    }

    changeMode(mode, e) {
        e.preventDefault()
        this.setState({mode: mode})
    }

    render() {
        let form = this[this.state.mode].bind(this)

        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.handleOpen.bind(this)}>
                {this.props.rev ? 'Edit' : 'Write a Review'}
            </button>
            <Dialog
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose.bind(this)}>
                {form()}
            </Dialog>
        </div>
    }

    review() {
        return <form onSubmit={this.handleSubmit.bind(this)} className="dialog">
            <h3>{`Review ${this.props.profileName} for position "${this.props.jobTitle}"`}</h3>
            {this.state.error && (
                <div className="form-error">{this.state.error}</div>
            )}
            <div className="form-group">
                <label htmlFor="review">Enter your review</label>
                <textarea id="review"
                    name="review"
                    rows={'4'}
                    value={this.state.review}
                    onChange={this.handleChange.bind(this)}
                    className="form-control"></textarea>
            </div>
            <div className="actions">
                <button type="submit" className="btn btn-success">
                    {this.props.fbUser == null  ? "Save & Sign Up" : "Save"}
                </button>
                <button type="button" className="btn btn-default" onClick={this.handleClose.bind(this)}>
                    Close
                </button>
            </div>
        </form>
    }

    signup() {
        return <div className="auth-form dialog">
            <h3>Sign up to post your review</h3>
            <SignupForm />
            <div className="centered">
                <span>Already on letsResume? </span>
                <a href="#" onClick={this.changeMode.bind(this, 'login')}>Log in</a>
            </div>
        </div>
    }

    login() {
        return <div className="auth-form dialog">
            <h3>Log in to post your review</h3>
            <LoginForm />
            <div className="centered">
                <span>New to letsResume? </span>
                <a href="#" onClick={this.changeMode.bind(this, 'signup')}>Sign Up</a>
            </div>
        </div>
    }
}

export {PublicProfile}
