import React from 'react'


class PublicProfile extends React.Component {

    componentDidMount() {
        let profileRef = firebase.database().ref('profile').child(this.props.uid)
        profileRef.on('value', (snap) => {
            this.setState(snap.val())
        })
    }

    render() {
        return <Profile profile={this.state} />
    }
}

class Profile extends React.Component {

    render() {
        // TODO: factorize layout
        return <div className="container content-section-a">
            <div className="container">
                <div className="row">
                    <div className="clearfix"></div>
                    {this.content()}
                </div>
            </div>
        </div>
    }

    content() {
        let profile = this.props.profile

        if (profile == null) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(profile.experience || [])

        return <div className="me">
            <h1>{profile['google-profile'].name}</h1>

            {refIds.map((refId) => {
                return <Experience key={"exp-" + refId} data={profile.experience[refId]} />
            })}
        </div>
    }
};


class Experience extends React.Component {
    render() {
        return <div className="job-experience">
            <h3>{this.props.data.companyName} - {this.props.data.jobTitle}</h3>

            {this.props.data.jobStartDate || this.props.data.jobEndDate ?
                <div className="job-dates">
                    {this.props.data.jobStartDate} to {this.props.data.jobEndDate || 'present'}
                </div>
            :
                null
            }
            <p className="job-description">
                {this.props.data.jobDescription}
            </p>
        </div>
    }
}

export {PublicProfile, Profile}
