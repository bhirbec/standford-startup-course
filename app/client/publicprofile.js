import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import Dialog from 'material-ui/Dialog';

import {SignupForm, LoginForm} from './auth'
import Form from './form'
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
        this.data = {}
        this.state = {mode: 'closed'}
    }

    post(fbUser) {
        let fb = firebase.database()
        let ref = fb.ref(`pendingReviews/${this.props.profileId}/${fbUser.uid}`)

        let pr
        if (this.props.rev) {
            pr = this.update(ref)
        } else {
            pr = this.create(ref, fbUser)
        }

        pr.then(() => {
            this.setState({mode: 'closed'})
            forceRefresh(this.props.profileId)
        })
    }

    create(ref, fbUser) {
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
                review: this.data.review,
                UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
            }

            return ref.push().set(data)
        })
    }

    update(ref) {
        return ref.child(this.props.rev.revId).update({
            review: this.data.review,
            UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
        })
    }

    delete() {
        let pr = this.props
        let fb = firebase.database()
        let ref = fb.ref(`pendingReviews/${pr.profileId}/${pr.fbUser.uid}/${pr.rev.revId}`)

        ref.remove().then(() => {
            forceRefresh(pr.profileId)
        })
    }

    onSubmit(data) {
        if (data.review == '') {
            this.setState({error: 'Review can not be empty.', 'mode': 'review'})
            return
        }

        this.data = data
        this.setState({'error': null})

        if (this.props.fbUser) {
            this.post(this.props.fbUser)
        } else {
            this.setState({mode: 'signup'})
        }
    }

    changeMode(mode) {
        this.setState({mode: mode})
    }

    render() {
        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.changeMode.bind(this, 'review')}>
                {this.props.rev ? 'Edit' : 'Write a Review'}
            </button>
            {this.props.rev && (
                <button type="button"
                    className="btn btn-default"
                    onClick={this.delete.bind(this)}>
                    Remove
                </button>
            )}
            <Dialog
                modal={false}
                open={this.state.mode != 'closed'}
                onRequestClose={this.changeMode.bind(this, 'closed')}>
                {this.state.mode != 'closed' && (
                    this[this.state.mode].bind(this)()
                )}
            </Dialog>
        </div>
    }

    review() {
        return <Form
            onSubmit={this.onSubmit.bind(this)}
            data={this.props.rev || {}}
            className="dialog">

            <h3>{`Review ${this.props.profileName} for position "${this.props.jobTitle}"`}</h3>

            {this.state.error && (
                <div className="form-error">{this.state.error}</div>
            )}
            <div className="form-group">
                <label htmlFor="review">Enter your review</label>
                <textarea id="review"
                    name="review"
                    rows={'4'}
                    className="form-control"></textarea>
            </div>
            <div className="actions">
                <button type="submit" className="btn btn-success">
                    {this.props.fbUser == null  ? "Save & Sign Up" : "Save"}
                </button>
                <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.changeMode.bind(this, 'closed')}>
                    Close
                </button>
            </div>
        </Form>
    }

    signup() {
        return <div className="auth-form dialog">
            <h3>Sign up to post your review</h3>
            <SignupForm resolve={this.post.bind(this)} />
            <div className="centered">
                <span>Already on letsResume? </span>
                <a href="#" onClick={this.changeMode.bind(this, 'login')}>Log in</a>
            </div>
        </div>
    }

    login() {
        return <div className="auth-form dialog">
            <h3>Log in to post your review</h3>
            <LoginForm resolve={this.post.bind(this)} />
            <div className="centered">
                <span>New to letsResume? </span>
                <a href="#" onClick={this.changeMode.bind(this, 'signup')}>Sign Up</a>
            </div>
        </div>
    }
}

export {PublicProfile}

