import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import Form from './form'


export default class Feedback extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onSubmit(data) {
        if (data.email == '') {
            this.setState({error: 'Email can not be empty.'})
            return
        }

        if (data.message == '') {
            this.setState({error: 'Message can not be empty.'})
            return
        }

        data.date = new Date().toJSON().slice(0,10).replace(/-/g,'/')

        firebase.database().ref('feedback').push().set(data).then(() => {
            this.setState({'error': null, done: true})
        }).catch(e => {
            this.setState({'error': e.message})
        })
    }

    render() {
        if (this.state.done) {
            return <div>
                <h1>Please send us your feedback!</h1>
                <p>Thanks for sending us your feedback.</p>
                <p>Go back to <Link to='/'>home page</Link>.</p>
            </div>
        }

        return <Form
            onSubmit={this.onSubmit.bind(this)}
            className="me experience-form">

            <h1>Please send us your feedback!</h1>

            <p>* required field</p>

            {this.state.error && (
                <div className="form-error">{this.state.error}</div>
            )}

            <div className="form-group">
                <label htmlFor="email">Your email *</label>
                <input id="email" name="email" type="text" />
            </div>

            <div className="form-group">
                <label htmlFor="message">Your message *</label>
                <textarea id="message"
                    name="message"
                    rows={'4'}
                    className="form-control"></textarea>
            </div>
            <div className="actions">
                <button type="submit" className="btn btn-success">Send Feedback</button>
            </div>
        </Form>
    }
}
