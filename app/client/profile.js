import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Route} from 'react-router-dom'

import NoMatch from './error'
import {EditableExperience, Experience, ExperienceForm} from './experience'
import {Reviews} from './review'


class MyProfile extends React.Component {
    render() {
        // TODO: move routes to app.js
        return <div>
            <Route exact path="/me" render={() => (
                <Profile fbUser={this.props.fbUser} profileId={this.props.fbUser.uid} />
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


class BaseProfile extends React.Component {
    componentDidMount() {
        this.fetch(this.props.profileId)
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    fetch(uid) {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        this.fbRef = fb.ref('profile').child(uid)

        this.fbRef.on('value', (snap) => {
            if (!snap.exists()) {
                this.setState({'notfound': true})
                return
            }

            // TODO: understand why snap.val() is null when the user signs in for the first time
            let profile = snap.val()
            if (profile == null) {
                return
            }

            profile.experience = profile.experience || {}
            this.setState(profile)
        })
    }

}

class Profile extends BaseProfile {
    render() {
        if (!this.state) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        }

        let expIds = Object.keys(this.state.experience)
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div>
            <div>
                View your <Link to={'/in/' + this.props.profileId}>public profile</Link>
            </div>
            <div className="me">
                <h1>{profileName}</h1>

                {expIds.map((expId) => {
                    return <EditableExperience
                        key={"exp-" + expId}
                        profileId={this.props.profileId}
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
            <Reviews {...this.props} />
        </div>
    }
}


class PublicProfile extends BaseProfile {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentWillReceiveProps(nextProps) {
        if (this.fbRef) {
            this.fbRef.off()
        }
        this.fetch(nextProps.profileId)
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        }

        let fbUser = this.props.fbUser
        let expIds = Object.keys(this.state.experience || [])
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
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

            {/* TODO: we should be able to remove profileName
            param when moving review form on another url */}
            <Reviews
                fbUser={fbUser}
                profileName={profileName}
                profileId={this.props.profileId} />
        </div>
    }
}

export {MyProfile, PublicProfile}
