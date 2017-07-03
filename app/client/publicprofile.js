import React from 'react'


class PublicProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentDidMount() {
        let profileRef = firebase.database().ref('profile').child(this.props.uid)
        profileRef.on('value', (snap) => {
            this.setState(snap.val())
        })
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience || [])

        return <div className="me">
            <h1>{this.state['google-profile'].name}</h1>

            {refIds.map((refId) => {
                return <Experience key={"exp-" + refId} data={this.state.experience[refId]} />
            })}
        </div>
    }
}


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

export {PublicProfile}
