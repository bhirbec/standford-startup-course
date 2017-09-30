import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Route} from 'react-router-dom'

import {EditableExperience, ExperienceForm} from './experience'


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
    render() {
        return <div>
            <div>
                View your <Link to={'/in/' + this.props.fbUser.uid}>public profile</Link>
            </div>
            <Resume {...this.props} />
            <Reviews {...this.props} />
        </div>
    }
}

class Resume extends React.Component {
    componentDidMount() {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        this.fbRef = fb.ref('profile').child(this.props.fbUser.uid)

        this.fbRef.on('value', (snap) => {
            // TODO: understand why snap.val() is null when the user signs in for the first time
            let profile = snap.val()
            if (profile == null) {
                return
            }

            profile.experience = profile.experience || {}
            this.setState(profile)
        })
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
            <h1>{profileName}</h1>

            {expIds.map((expId) => {
                return <EditableExperience
                    key={"exp-" + expId}
                    profileId={this.props.fbUser.uid}
                    expId={expId}
                    exp={this.state.experience[expId]} />
            })}

            <div className="new-work-experience">
                <Link to={'/me/experience'}>
                    <button type="button" className="btn btn-default">
                        + Add work experience
                    </button>
                </Link>
            </div>
        </div>
    }
};


class Reviews extends React.Component {
    constructor(props) {
        super(props)
        this.state = {reviews: []}
    }

    componentDidMount() {
        let fb = firebase.database()
        let uid = this.props.fbUser.uid
        let ref = fb.ref('publicReviews').orderByChild("toUid").equalTo(uid)

        ref.once('value').then((snap) => {
            let reviews = []
            snap.forEach((snap) => {
                let rev = snap.val()
                if (rev.review) {
                    rev.revId = snap.key
                    reviews.push(rev)
                }
            })
            this.setState({reviews: reviews})
        })
    }

    render() {
        return <div className="reviews">
            <h1>Reviews</h1>
            {this.state.reviews.map(rev => {
                return <Review key={'review-' + rev.revId} rev={rev} />
            })}
        </div>
    }
}


class Review extends React.Component {
    render() {
        let rev = this.props.rev

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
        </div>
    }
}


export {Me}
