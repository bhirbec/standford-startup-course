import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import Dialog from 'material-ui/Dialog';

import {SignupComponent, LoginComponent} from './auth'
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
            {this.state.reviews.map(rev => {
                return <Review key={'review-' + rev.revId} rev={rev} {...this.props} />
            })}

            {(fbUser === null || fbUser.uid != this.props.profileId) && (
                <ReviewFrom {...this.props} />
            )}
        </div>
    }
}

class Review extends React.Component {
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
                    <ReviewFrom {...this.props} />
                </div>
            )}
        </div>
    }
}

// TODO: split this form into NewReviewForm and EditReviewForm
class ReviewFrom extends React.Component {
    constructor(props) {
        super(props)
        this.data = {}
        this.state = {mode: 'closed'}
    }

    post(fbUser) {
        let pr
        if (this.props.rev) {
            pr = this.update()
        } else {
            pr = this.create(fbUser)
        }

        pr.then(() => {
            this.setState({mode: 'closed'})
        })
    }

    create(fbUser) {
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
                review: this.data.review,
                UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
            }

            let ref = firebase.database().ref('publicReviews')
            return ref.push().set(data)
        })
    }

    update() {
        let ref = firebase.database().ref('publicReviews')
        return ref.child(this.props.rev.revId).update({
            review: this.data.review,
            UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
        })
    }

    delete() {
        let ref = firebase.database().ref('publicReviews')
        ref.child(this.props.rev.revId).child('review').remove()
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

            {!this.props.rev && (
                <button type="button"
                    className="btn btn-default new-review-button"
                    onClick={this.changeMode.bind(this, 'review')}>
                    Write a Review
                </button>
            )}

            {this.props.rev && (
                <button type="button"
                    className="btn btn-default"
                    onClick={this.changeMode.bind(this, 'review')}>
                    Edit
                </button>
            )}

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

            <h3>{`Review ${this.props.profileName}`}</h3>

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
        return <div className="dialog">
            <SignupComponent
                title="Sign up to post your review"
                onClickLogin={this.changeMode.bind(this, 'login')}
                resolve={this.post.bind(this)} />
        </div>
    }

    login() {
        return <div className="dialog">
            <LoginComponent
                title="Log in to post your review"
                onClickSignup={this.changeMode.bind(this, 'signup')}
                resolve={this.post.bind(this)} />
        </div>
    }
}

export {Reviews}
