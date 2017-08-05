import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import {Link} from 'react-router-dom'

import Multiselect from './multiselect'
import {currentUser} from './auth'
// TODO: do we need BaseForm?
import {BaseForm} from './form'


function joinReviews(profile, reviews) {
    profile.experience = profile.experience || {}

    for (let expId in profile.experience ) {
        let exp = profile.experience[expId]
        exp.reviews = []

        for (let revId in reviews) {
            if (reviews[revId].expId == expId) {
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
    constructor(props) {
        super(props)
        this.fbUser = currentUser()
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
            let pendingRef = fb.ref('pendingReviews').child(uid)
            let publicRef = fb.ref('publicReviews').orderByChild("toUid").equalTo(uid)

            pendingRef.once('value').then((snap) => {
                snap.forEach((snap1) => {
                    snap1.forEach((snap2) => {
                        reviews[snap2.key] = snap2.val()
                        reviews[snap2.key].status = 'pending'
                    })
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
        })
    }

    componentDidMount() {
        this.fetchProfileAndSetState(this.fbUser.uid)
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
                View your <Link to={'/in/' + this.fbUser.uid}>public profile</Link>
            </div>

            <h1>{profileName}</h1>

            {expIds.map((expId) => {
                return <Experience
                    key={"exp-" + expId}
                    fbRef={this.fbRef.child('experience/' + expId)}
                    profileId={this.props.profileId}
                    expId={expId}
                    exp={this.state.experience[expId]} />
            })}

            {expIds.length < 5 ? <NewExperienceButton profileRef={this.fbRef} /> : null}
        </div>
    }
};


class Experience extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    save(data) {
        // TODO: can we return a promise?
        let $node = $(ReactDOM.findDOMNode(this))
        this.props.fbRef.set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    remove() {
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

            {exp.reviews.map((rev, i) => {
                return <Review
                    key={'review-' + rev.revId}
                    fbref={this.props.fbRef.child('reviewStatus').child(rev.revId)}
                    rev={rev} />
            })}
        </div>
    }
}


class Review extends React.Component {
    publish() {
        let rev = this.props.rev
        let fb = firebase.database()
        fb.ref('publicReviews').child(rev.revId).set(rev).then((snap) => {forceRefresh(rev.toUid)})
    }

    unpublish() {
        let rev = this.props.rev
        let fb = firebase.database()
        fb.ref('publicReviews').child(rev.revId).remove().then((snap) => {forceRefresh(rev.toUid)})
    }

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
                <span> - {rev.status}</span>
            </div>
            <div className="review-buttons">
                {rev.status == 'pending' && (
                    <button type="button"
                        className="btn btn-default"
                        onClick={this.publish.bind(this)}>
                        Show on public profile</button>
                )}
                {rev.status == 'public' && (
                    <button type="button"
                        className="btn btn-default"
                        onClick={this.unpublish.bind(this)}>
                        Hide from public profile</button>
                )}
            </div>
        </div>
    }
}

class NewExperienceButton extends React.Component {

    save(data) {
        // TODO: can we return a promise?
        let $node = $(ReactDOM.findDOMNode(this))
        this.props.profileRef.child('experience').push().set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    onClick() {
        this.forceUpdate()
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
    }

    render() {
        return <div className="new-work-experience">
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                + Add work experience</button>
            <Modal title={'Add work experience'}
                save={this.save.bind(this)}
                data={{}} />
        </div>
    }
}

class Modal extends BaseForm {

    handleForm(e) {
        let data = this.formData();
        this.props.save(data)
        e.preventDefault()
    }

    render() {
        return <div className="modal fade" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">
                            &times;
                        </button>
                        <h4 className="modal-title">{this.props.title}</h4>
                    </div>
                    <form onSubmit={this.handleForm.bind(this)}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="company-name">Company Name</label>
                                <input id="company-name"
                                    name="companyName"
                                    type="text"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="ex: Google" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-title">Job Title</label>
                                <input id="job-title"
                                    name="jobTitle"
                                    type="text"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="ex: Software Engineer" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea id="job-description"
                                    name="jobDescription"
                                    rows={'4'}
                                    ref={this.setValue.bind(this)}
                                    className="form-control"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-start-date">Start Date</label>
                                <input id="job-start-data"
                                    name="jobStartDate"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="mm/yyyy" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-end-date">End Date (leave empty for current position)</label>
                                <input id="job-end-data"
                                    name="jobEndDate"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="mm/yyyy" />
                            </div>
                            <div className="form-group">
                                <label>Invite People to Comment your resume</label>
                                <Multiselect title="Search your Google contacts" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Save</button>
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

export {joinReviews, forceRefresh, Me}
