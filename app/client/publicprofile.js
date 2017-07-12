import React from 'react'
import ReactDOM from 'react-dom'

import {SetValue, FormData} from './form'
import {SignupForm, LoginForm} from './auth'


class PublicProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentDidMount() {
        let profileRef = firebase.database().ref('profile').child(this.props.profileId)
        profileRef.on('value', (snap) => {
            this.setState(snap.val())
        })
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience || [])
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            <h1>{profileName}</h1>

            {refIds.map((expId) => {
                let reviews = []
                if (this.state.review) {
                    for (let revId in this.state.review[expId] || {}) {
                        reviews.push(this.state.review[expId][revId])
                    }
                }

                return <Experience
                    key={"exp-" + expId}
                    user={this.props.user}
                    profileName={profileName}
                    profileId={this.props.profileId}
                    expId={expId}
                    exp={this.state.experience[expId]}
                    reviews={reviews} />
            })}
        </div>
    }
}


class Experience extends React.Component {
    render() {
        return <div className="job-experience">
            <h3>{this.props.exp.companyName} - {this.props.exp.jobTitle}</h3>

            {(this.props.exp.jobStartDate || this.props.exp.jobEndDate) && (
                <div className="job-dates">
                    {this.props.exp.jobStartDate} to {this.props.exp.jobEndDate || 'present'}
                </div>
            )}

            <p className="job-description">
                {this.props.exp.jobDescription}
            </p>

            {this.props.reviews.map((rev, i) => {
                return <div key={'review-' + this.props.expId + '-' + i} className="review">
                    <div className="review-text">
                        &ldquo;{rev.review}&rdquo;
                    </div>
                    <div className="review-info">Someone - {rev.UTCdate}</div>
                </div>
            })}

            <NewReview
                user={this.props.user}
                profileId={this.props.profileId}
                profileName={this.props.profileName}
                expId={this.props.expId}
                jobTitle={this.props.exp.jobTitle} />
        </div>
    }
}

class NewReview extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    save(data) {
        let refStr = `profile/${this.props.profileId}/review/${this.props.expId}`
        let ref = firebase.database().ref(refStr)
        let $node = $(ReactDOM.findDOMNode(this))

        ref.push().set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    render() {
        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Add a Review
            </button>
            <Modal profileName={this.props.profileName}
                jobTitle={this.props.jobTitle}
                user={this.props.user}
                save={this.save.bind(this)}
                data={{}} />
        </div>
    }
}

class Modal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {mode: 'review'}
    }

    handleForm(e) {
        if (this.props.user) {
            this.postReview(this.props.user)
        } else {
            this.setState({mode: 'signup'})
        }
        e.preventDefault()
    }

    postReview(fbUser) {
        let data = {}
        data.review = this.state.review
        data.fromUserId = fbUser.uid
        data.UTCdate = new Date().toJSON().slice(0,10).replace(/-/g,'/')
        this.props.save(data)
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
                        {this.props.user == null  ? "Save & Sign Up" : "Save"}
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
