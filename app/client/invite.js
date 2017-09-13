import React from 'react'
import ReactDOM from 'react-dom'
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import Form from './form'


export default class InviteForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {mode: 'closed'}
    }

    changeMode(mode, e) {
        this.setState({mode: mode})
        e.preventDefault()
    }

    handleSnackbarClose() {
        this.setState({ack: null})
    }

    onSubmit(data) {
        if (data.toEmail == "") {
            this.setState({error: "Email can not be empty"})
            return false
        }

        firebase.database().ref('invites').push().set(data).then(() => {
            let ack = `An invitation was sent to ${data.toEmail}!`
            this.setState({mode: 'closed', 'ack': ack})
        })
    }

    render() {
        return <a href="#" onClick={this.changeMode.bind(this, 'open')} className="invite">
            <i className="material-icons">person_add</i>
            Invite Reviewer

            <Snackbar
                open={Boolean(this.state.ack)}
                message={this.state.ack || ''}
                autoHideDuration={5000}
                className='snack'
                onRequestClose={this.handleSnackbarClose.bind(this)}
            />

            <Dialog
                modal={false}
                open={this.state.mode == 'open'}
                onRequestClose={this.changeMode.bind(this, 'closed')}>

                <Form onSubmit={this.onSubmit.bind(this)}
                    data={{fromUid: this.props.profileId}}
                    className="dialog">

                    <h3>Invite a Reviewer</h3>

                    {this.state.error && (
                        <div className="form-error">{this.state.error}</div>
                    )}

                    <input name="fromUid" type="hidden" />

                    <div className="form-group">
                        <label htmlFor="toEmail">Enter email</label>
                        <input id="toEmail" name="toEmail" type="text" className="form-control" />
                    </div>

                    <div className="actions">
                        <button type="submit" className="btn btn-success">Send</button>
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={this.changeMode.bind(this, 'closed')}>
                            Close
                        </button>
                    </div>
                </Form>
            </Dialog>
        </a>
    }
}
