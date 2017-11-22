import React from 'react'
import ReactDOM from 'react-dom'
import Snackbar from 'material-ui/Snackbar';

import Form from './form'
import SocialButtons from './social'


export default class ShareProfile extends React.Component {
    componentDidMount() {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        let fbRef = fb.ref('profile').child(this.props.profileId).child('view')

        fbRef.once('value').then(snap => {
            this.setState(snap.val())
        })
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
            let resetData = {fromUid: this.props.profileId, toEmail: ''}
            this.setState({error: null, 'ack': ack, data: resetData})
        })
    }

    render() {
        if (this.state == null) {
            return null
        }

        return <div>
            <div className="me">
                <h1>Share your profile</h1>

                <h2>Share on social networks</h2>
                <p>Click on social icons to post on your favorite social networks.</p>
                <SocialButtons
                    shareUrl={`https://letsresume.com/in/${this.props.profileId}`}
                    title={`Checkout ${this.state.identity.firstname} on LetsResume`}
                    className="my-sharing" />

                <h2>Invite by email</h2>
                <Form onSubmit={this.onSubmit.bind(this)}
                    data={{fromUid: this.props.profileId}}>

                    {this.state.error && (
                        <div className="form-error">{this.state.error}</div>
                    )}

                    <input name="fromUid" type="hidden" />

                    <div className="form-group">
                        <label htmlFor="toEmail">
                            Enter recipient emails (separated by comma). We will send an invite on your behalf:
                        </label>
                        <textarea id="toEmail"
                            name="toEmail"
                            className="form-control"
                            rows={6}
                            placeholder="example@gmail.com, someone@yahoo.com, etc..."/>
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn btn-success">Send</button>
                    </div>
                </Form>
            </div>
            <Snackbar
                open={Boolean(this.state.ack)}
                message={this.state.ack || ''}
                autoHideDuration={5000}
                className='snack'
                onRequestClose={this.handleSnackbarClose.bind(this)}
            />
        </div>
    }
}
