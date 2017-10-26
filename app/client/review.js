import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import {postReview, pending} from './model'
import Form from './form'


class Reviews extends React.Component {
    constructor(props) {
        super(props)
        this.state = {reviews: []}
    }

    componentDidMount() {
        let fb = firebase.database()
        this.ref = fb.ref('publicReviews').orderByChild("toUid").equalTo(this.props.profileId)

        this.ref.on('value', snap => {
            let reviews = []
            snap.forEach(snap => {
                let rev = snap.val()
                if (rev.review) {
                    rev.revId = snap.key
                    reviews.push(rev)
                }
            })
            this.setState({reviews: reviews})
        })
    }

    componentWillUnmount() {
        this.ref.off()
    }

    render() {
        let fbUser = this.props.fbUser

        return <div className="reviews">
            <h2>Reviews</h2>
            {this.state.reviews.length == 0 && (
                <p>No reviews...</p>
            )}
            {this.state.reviews.map(rev => {
                return <Review key={'review-' + rev.revId} rev={rev} {...this.props} />
            })}
        </div>
    }
}

class Review extends React.Component {
    delete() {
        let ref = firebase.database().ref('publicReviews')
        ref.child(this.props.rev.revId).child('review').remove()
    }

    render() {
        let rev = this.props.rev
        let fbUser = this.props.fbUser

        return <div className="review">
            <div className="review-info">
                <Link to={`/in/${rev.fromUid}`}>
                    {rev.reviewer.firstname} {rev.reviewer.lastname}
                </Link>
                <span> - {rev.UTCdate}</span>
            </div>
            <div className="review-text">
                &ldquo;{rev.review}&rdquo;
            </div>
            {fbUser && fbUser.uid == rev.fromUid && (
                <div className="review-buttons">
                    <Link to={`/in/${this.props.profileId}/review/${rev.revId}`}>
                        <button type="button" className="btn btn-default">Edit</button>
                    </Link>
                    <button type="button"
                        className="btn btn-default"
                        onClick={this.delete.bind(this)}>
                        Remove
                    </button>
                </div>
            )}
        </div>
    }
}

// TODO: split this form into NewReviewForm and EditReviewForm?
class ReviewFrom extends React.Component {

    componentDidMount() {
        let fb = firebase.database()
        let state = {}
        let pr = fb.ref('profile').child(this.props.profileId).child('view').once('value')

        pr.then(snap => {
            let view = snap.val()
            state['profileName'] = `${view.identity.firstname} ${view.identity.lastname}`

            if (!this.props.revId) {
                return Promise.reject()
            } else {
                return fb.ref('publicReviews').child(this.props.revId).once('value')
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
        let ref = firebase.database().ref('publicReviews')
        return ref.child(this.props.revId).update({
            review: review,
            UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
        })
    }

    onSubmit(data) {
        if (data.review == '') {
            this.setState({error: 'Review can not be empty.'})
            return
        }

        this.setState({'error': null})

        if (!this.props.fbUser) {
            pending.stageReview(this.props.profileId, data.review)
            this.setState({redirect: '/signup'})
            return
        }

        let pr
        if (this.props.revId) {
            pr = this.update(data.review)
        } else {
            pr = postReview(this.props.fbUser, this.props.profileId, data.review)
        }

        pr.then(() => {
            this.setState({redirect: `/in/${this.props.profileId}`})
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
