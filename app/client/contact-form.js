import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import Form from './form'


export default class ContactForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onSubmit(data) {
        if (data.text == "") {
            this.setState({error: "Message can not be empty"})
            return false
        }

        this.props.fbUser.getIdToken().then(idToken => {
            data.idToken = idToken
            data.toUid = this.props.profileId
            data.fromUid = this.props.fbUser.uid
            return firebase.database().ref('queue/message').push().set(data)
        })
        .then(() => {
            gtag('event', 'contact-request', {
                'event_category': 'engagement',
                'event_label': `Contact Request`
            })

            this.setState({redirectUri: `/in/${this.props.profileId}`})
        })
        .catch(error => {
            this.setState({error: error})
        })
    }

    onTouchTap(e) {
        e.preventDefault()
        $(ReactDOM.findDOMNode(this)).submit()
    }

    render() {
        return <Form onSubmit={this.onSubmit.bind(this)}>
            <h1>Message</h1>

            {this.state.redirectUri && (
                <Redirect to={this.state.redirectUri} />
            )}

            {this.state.error && (
                <div className="form-error">{this.state.error}</div>
            )}

            <div className="form-group">
                <label htmlFor="toMessage">Your message:</label>
                <textarea id="toMessage" rows={10} name="text" className="form-control" />
            </div>

            <div>
                <button
                    type="submit"
                    onTouchTap={this.onTouchTap.bind(this)}
                    className="btn btn-success">Save</button>
                <Link to={`/in/${this.props.profileId}`}>
                    <button type="button" className="btn btn-default">Back</button>
                </Link>
            </div>
        </Form>
    }
}
