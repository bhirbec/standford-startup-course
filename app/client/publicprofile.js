import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'

import NoMatch from './error'
import {Experience} from './experience'
import {Reviews} from './review'


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

            <Reviews
                fbUser={fbUser}
                profileName={profileName}
                profileId={this.props.profileId} />
        </div>
    }
}


export {PublicProfile}

