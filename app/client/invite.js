import React from 'react'
import ReactDOM from 'react-dom'
import Dialog from 'material-ui/Dialog';

import Form from './form'


export default class InviteForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {mode: 'closed'}
    }

    changeMode(mode) {
        this.setState({mode: mode})
    }

    onSubmit(data) {
        firebase.database().ref('queue/email/tasks').push().set(data).then(() => {
            this.setState({mode: 'closed'})
        })
    }

    render() {
        return <span>
            <button type="button"
                className="btn btn-success"
                onClick={this.changeMode.bind(this, 'open')}>
                + Invite Reviewer
            </button>
            <Dialog
                modal={false}
                open={this.state.mode == 'open'}
                onRequestClose={this.changeMode.bind(this, 'closed')}>

                <Form onSubmit={this.onSubmit.bind(this)}
                    data={{profileId: this.props.profileId}}
                    className="dialog">

                    <h3>Invite a Reviewer</h3>

                    {this.state.error && (
                        <div className="form-error">{this.state.error}</div>
                    )}

                    <input name="profileId" type="hidden" />

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
        </span>
    }
}
