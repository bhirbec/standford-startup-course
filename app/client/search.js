import React from 'react'
import ReactDOM from 'react-dom'

import {Link} from 'react-router-dom'


class Search extends React.Component {

    componentDidMount() {
        let db = firebase.database()

        db.ref('profile').child('5M7pXK3twXegXSaexip1ARA2qm02').child('info').once('value', (snap) => {
            this.setState({'benoit': snap.val()})
        })

        db.ref('profile').child('lCxNpj5R0CMCrXZ9EnkSSUZwzYg2').child('info').once('value', (snap) => {
            this.setState({'benito': snap.val()})
        })
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        return <div>
            <div>
                This is just a static list of profiles so we can browse more easily (only visible
                by Reagan & Ben)
            </div>
            {this.state.benoit && (
                <div>
                    <h2>{this.state.benoit.firstname} {this.state.benoit.lastname}</h2>
                    <Link to='/in/5M7pXK3twXegXSaexip1ARA2qm02'>View profile</Link>
                </div>
            )}
            {this.state.benito && (
                <div>
                    <h2>{this.state.benito.firstname} {this.state.benito.lastname}</h2>
                    <Link to='/in/lCxNpj5R0CMCrXZ9EnkSSUZwzYg2'>View profile</Link>
                </div>
            )}
        </div>
    }
}

export {Search}
