import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import InviteForm from './invite'
import {postReview, pending} from './model'
import Form from './form'
import {UserAvatar} from './common'


class Reviews extends React.Component {
    render() {
        let reviews = this.props.reviews || {}
        reviews = Object.keys(reviews).map(k => reviews[k])

        return <div className="reviews">
            <h3>What the crowd is saying</h3>
            {(reviews.length == 0 && !this.props.me) && (
                <p>No reviews just yet.</p>
            )}

            {(reviews.length == 0 && this.props.me) && (
                <InviteForm profileId={this.props.profileId} />
            )}

            {reviews.map(rev => {
                return <Review key={'review-' + rev.revId} rev={rev} {...this.props} />
            })}
        </div>
    }
}

class Review extends React.Component {
    delete(e) {
        e.preventDefault()

        firebase.database().ref('profile')
            .child(this.props.fbUser.uid)
            .child('reviewsSent')
            .child(this.props.rev.toUid)
            .child(this.props.rev.revId)
            .remove()
    }

    render() {
        let rev = this.props.rev
        let fbUser = this.props.fbUser

        return <div className="review clearfix">
            <div className="review-header">
                <UserAvatar identity={rev.reviewerIdentity} size={40} />
            </div>
            <div className="review-body">
                <div className="review-info">
                    <Link to={`/in/${rev.fromUid}`}>
                        {rev.reviewerIdentity.firstname} {rev.reviewerIdentity.lastname}
                    </Link>
                    <span> - {rev.UTCdate}</span>
                </div>
                <div className="review-text">
                    &ldquo;{rev.review}&rdquo;
                </div>
                {fbUser && fbUser.uid == rev.fromUid && (
                    <div className="review-buttons">
                        <Link to={`/in/${this.props.profileId}/review/${rev.revId}`}>
                            <i className="material-icons">edit</i>Edit
                        </Link>
                        <a href="#" onClick={this.delete.bind(this)}>
                            <i className="material-icons">delete</i>Remove
                        </a>
                    </div>
                )}
            </div>
        </div>
    }
}

// TODO: split this form into NewReviewForm and EditReviewForm?
class ReviewFrom extends React.Component {

    componentDidMount() {
        let fb = firebase.database()
        let props = this.props
        let state = {}
        let pr = fb.ref(`profile/${props.profileId}/view/identity`).once('value')

        pr.then(snap => {
            let identity = snap.val()
            state['profileName'] = `${identity.firstname} ${identity.lastname}`

            if (!props.revId) {
                return Promise.reject()
            } else {
                let path = `profile/${props.fbUser.uid}/reviewsSent/${props.profileId}/${props.revId}`
                return fb.ref(path).once('value')
            }
        }).then(snap => {
            state.rev = snap.val()
            this.setState(state)
        }).catch(error => {
            if (error) {
                state.error = error
            }
            this.setState(state)
        })
    }

    update(review) {
        let data = {}
        let props = this.props
        let path = `profile/${props.fbUser.uid}/reviewsSent/${props.profileId}/${props.revId}`
        data[`${path}/review`] = review
        data[`${path}/UTCdate`] = new Date().toJSON().slice(0,10).replace(/-/g,'/')
        return firebase.database().ref().update(data)
    }

    onSubmit(data) {
        if (data.review == '') {
            this.setState({error: 'Review can not be empty.'})
            return
        }

        let eventName = this.props.revId ? 'review-updated' : 'review-added'
        gtag('event', eventName, {
            'event_category': 'engagement',
            'event_label': `Review`,
        })

        if (!this.props.fbUser) {
            pending.stageReview(this.props.profileId, data.review)
            this.setState({'error': null, redirect: '/signup'})
            return
        }

        let pr
        if (this.props.revId) {
            pr = this.update(data.review)
        } else {
            pr = postReview(this.props.fbUser, this.props.profileId, data.review)
        }

        pr.then(() => {
            this.setState({'error': null, redirect: `/in/${this.props.profileId}`})
        })
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        } else if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return <Form
            onSubmit={this.onSubmit.bind(this)}
            data={this.state.rev}
            className="experience-form">

            <h1>{`Review ${this.state.profileName}`}</h1>

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
                <Link to={`/in/${this.props.profileId}`}>
                    <button type="button" className="btn btn-default">Back</button>
                </Link>
            </div>
        </Form>
    }
}

export {Reviews, ReviewFrom}
