import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'
import Dialog from 'material-ui/Dialog';

import Form from './form'


// TODO: should we create a mode/profile.js?
function joinReviews(profile, reviews) {
    profile.experience = profile.experience || {}

    for (let expId in profile.experience ) {
        let exp = profile.experience[expId]
        exp.reviews = []

        for (let revId in reviews) {
            if (reviews[revId].expId == expId && reviews[revId].review) {
                let review = reviews[revId]
                review.revId = revId
                exp.reviews.push(reviews[revId])
            }
        }
    }
}

/* we touch a 'ts' node under profile/$uid so we can force a refresh
when someone write a review. Is there a better way to do this? */
function forceRefresh(uid) {
    let fb = firebase.database()
    fb.ref('profile').child(uid).child('ts').set(Date.now())
}

class Me extends React.Component {
    render() {
        // TODO: move routes to app.js
        return <div>
            <Route exact path="/me" render={() => (
                <Profile fbUser={this.props.fbUser} />
            )} />
            <Route exact path="/me/experience" render={() => (
                <ExperienceForm fbUser={this.props.fbUser} />
            )} />
            <Route exact path="/me/experience/:id" render={(data) => (
                <ExperienceForm expId={data.match.params.id} fbUser={this.props.fbUser} />
            )} />
        </div>
    }
}

class Profile extends React.Component {

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
            let ref = fb.ref('publicReviews').orderByChild("toUid").equalTo(uid)

            ref.once('value').then((snap) => {
                snap.forEach((snap1) => {
                    reviews[snap1.key] = snap1.val()
                })

                joinReviews(profile, reviews)
                this.setState(profile)
            })
        })
    }

    componentDidMount() {
        this.fetchProfileAndSetState(this.props.fbUser.uid)
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        let expIds = Object.keys(this.state.experience)
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            <div>
                View your <Link to={'/in/' + this.props.fbUser.uid}>public profile</Link>
            </div>

            <h1>{profileName}</h1>

            {expIds.map((expId) => {
                return <Experience
                    key={"exp-" + expId}
                    fbRef={this.fbRef.child('experience/' + expId)}
                    profileId={this.props.fbUser.uid}
                    expId={expId}
                    exp={this.state.experience[expId]} />
            })}

            {expIds.length < 5 && (
                <div className="new-work-experience">
                    <Link to={'/me/experience'}>
                        <button type="button" className="btn btn-default">
                            + Add work experience
                        </button>
                    </Link>
                </div>
            )}
        </div>
    }
};


class Experience extends React.Component {

    remove() {
        // TODO: remove reviews?
        let b = confirm('Do you want to remove this work experience?')
        if (b == true) {
            this.props.fbRef.remove()
        }
    }

    render() {
        let exp = this.props.exp

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

            <Link to={'/me/experience/' + this.props.expId}>
                <button type="button" className="btn btn-default">Edit</button>
            </Link>

            <button type="button"
                className="btn btn-default"
                onClick={this.remove.bind(this)}>
                Remove</button>

            {exp.reviews.map((rev, i) => {
                return <Review key={'review-' + rev.revId} rev={rev} />
            })}
        </div>
    }
}


class Review extends React.Component {
    render() {
        let rev = this.props.rev

        return <div className="review">
            <div className="review-text">
                &ldquo;{rev.review}&rdquo;
            </div>
            <div className="review-info">
                <Link to={`/in/${rev.fromUid}`}>
                    {rev.reviewer.firstname} {rev.reviewer.lastname}
                </Link>
                <span> - {rev.UTCdate}</span>
            </div>
        </div>
    }
}

class ExperienceForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.expId ? null : {}
    }

    componentDidMount() {
        if (this.props.expId) {
            let fb = firebase.database()
            let ref = fb.ref('profile/' + this.props.fbUser.uid + '/experience/' + this.props.expId)
            ref.once('value').then((snap) => { this.setState(snap.val()) })
        }
    }

    onSubmit(data) {
        if (!this.validate(data)) {
            return
        }

        let fb = firebase.database()
        let ref = fb.ref('profile').child(this.props.fbUser.uid).child('experience')

        let p
        if (this.props.expId) {
            p = ref.child(this.props.expId).set(data)
        } else {
            p = ref.push().set(data)
        }

        p.then(() => {
            this.setState({'redirect': '/me'})
        })
    }

    validate(data) {
        if (data.companyName == "") {
            this.setState({error: "Company name can not be empty"})
            return false
        }

        if (data.jobTitle == "") {
            this.setState({error: "Job title can not be empty"})
            return false
        }

        if (data.jobDescription == "") {
            this.setState({error: "Job description can not be empty"})
            return false
        }

        if (data.jobStartDate == "") {
            this.setState({error: "Start date can not be empty"})
            return false
        }
        return true
    }

    render() {
        if (this.state == null) {
            return null
        }

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return <div className="experience-form">
            {this.props.expId == undefined ?
                <h1>New Work Experience</h1>
                :
                <h1>{this.state.companyName} - {this.state.jobTitle}</h1>
            }
            <Form onSubmit={this.onSubmit.bind(this)} data={this.state}>
                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="company-name">Company Name</label>
                    <input id="company-name"
                        name="companyName"
                        type="text"
                        className="form-control"
                        placeholder="ex: Google" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-title">Job Title</label>
                    <input id="job-title"
                        name="jobTitle"
                        type="text"
                        className="form-control"
                        placeholder="ex: Software Engineer" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-description">Job Description</label>
                    <textarea id="job-description"
                        name="jobDescription"
                        rows={'12'}
                        className="form-control"></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="job-start-date">Start Date</label>
                    <input id="job-start-data"
                        name="jobStartDate"
                        type="text"
                        className="form-control"
                        placeholder="mm/yyyy" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-end-date">End Date (leave empty for current position)</label>
                    <input id="job-end-data"
                        name="jobEndDate"
                        type="text"
                        className="form-control"
                        placeholder="mm/yyyy" />
                </div>
                <div>
                    <button type="submit" className="btn btn-success">Save</button>
                    <Link to="/me">
                        <button type="button" className="btn btn-default">Back</button>
                    </Link>
                </div>
            </Form>
        </div>
    }
}

export {joinReviews, forceRefresh, Me}
