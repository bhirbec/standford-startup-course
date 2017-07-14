import React from 'react'
import ReactDOM from 'react-dom'

import {Link} from 'react-router-dom'


class Search extends React.Component {

    componentDidMount() {
        let db = firebase.database()

        db.ref('profile').child('5M7pXK3twXegXSaexip1ARA2qm02').child('info').once('value', (snap) => {
            this.setState({'benoit': snap.val()})
        })

        db.ref('profile').child('ujaAcjlu3gMPdtWrNq39x7HvzAT2').child('info').once('value', (snap) => {
            this.setState({'reagan': snap.val()})
        })

        db.ref('profile').child('lCxNpj5R0CMCrXZ9EnkSSUZwzYg2').child('info').once('value', (snap) => {
            this.setState({'someguy': snap.val()})
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
            {this.state.reagan && (
                <div>
                    <h2>{this.state.reagan.firstname} {this.state.reagan.lastname}</h2>
                    <Link to='/in/ujaAcjlu3gMPdtWrNq39x7HvzAT2'>View profile</Link>
                </div>
            )}
            {this.state.someguy && (
                <div>
                    <h2>{this.state.someguy.firstname} {this.state.someguy.lastname}</h2>
                    <Link to='/in/lCxNpj5R0CMCrXZ9EnkSSUZwzYg2'>View profile</Link>
                </div>
            )}
        </div>
    }
}

export {Search}
