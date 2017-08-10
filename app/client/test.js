import React from 'react'
import ReactDOM from 'react-dom'

import {currentUser} from './auth'


export default class Test extends React.Component {
    constructor(props) {
        super(props)
        this.state = {run: false}
    }

    onClick() {
        this.setState({run: true})
    }

    render() {
        return <div>
            <div>Security Tests (only visible by Reagan & Ben)</div>
            <h1>Tests</h1>


            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}
                style={{margin: '15px 0'}}>
                Run all
            </button>

            <table className='tests'>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Expected</th>
                        <th>Run</th>
                        <th>Result</th>
                    </tr>
                    <ReviewValidation
                        name='Review format validation'
                        desc='Write a review with missing fields like "fromUid" or "toUid"'
                        expected='not allowed'
                        run={this.state.run} />
                    <OverrideFromUid
                        name='Review impersonation'
                        desc='Override "fromUid" field in a review'
                        expected='not allowed'
                        run={this.state.run} />
                    <OverrideReview
                        name='Review impersonation'
                        desc='Override "review" field in a review'
                        expected='not allowed'
                        run={this.state.run} />
                    <OverrideToUid
                        name='Review impersonation'
                        desc='Override "toUid" field in a review'
                        expected='not allowed'
                        run={this.state.run} />
                </tbody>
            </table>
        </div>
    }
}


class WriteTest extends React.Component {
    constructor(props) {
        super(props)
        this.fbUser = currentUser()
        this.fb = firebase.database()
     }

     componentDidMount() {
        if (this.props.run) {
            this._run()
        }
     }

     componentWillReceiveProps(nextProps) {
        if (nextProps.run) {
            this._run()
        }
     }

    _run() {
        this.setState({'status': 'running'})

        this.run().then(() => {
            this.setState({status: 'allowed' == this.props.expected})
        })
        .catch((e) => {
            if (e.code == 'PERMISSION_DENIED') {
                this.setState({status: 'not allowed' == this.props.expected})
            } else {
                console.log(e)
                this.setState({status: 'error'})
            }
        })
    }

    onClick(e) {
        e.preventDefault()
        this._run()
    }

    render() {
        let statuses = {
            true: 'ok',
            false: 'not ok',
            running: 'Running',
            error: 'An error occured',
        }

        return <tr>
            <td>{this.props.name}</td>
            <td>{this.props.desc}</td>
            <td>{this.props.expected}</td>
            <td><a href="#" onClick={this.onClick.bind(this)}>Run</a></td>
            <td><div style={{width: '60px'}}>{this.state && ( statuses[this.state.status])}</div></td>
        </tr>
    }
}


class ReviewValidation extends WriteTest {
    run(fb) {
        return this.fb.ref('publicReviews').push().set({'x': true})
    }
}


class ReviewImpersonation extends WriteTest {
    run(fb) {
        let uid = '5M7pXK3twXegXSaexip1ARA2qm02'
        let ref = this.fb.ref('publicReviews').orderByChild("fromUid").equalTo(uid).limitToFirst(1)

        return ref.once('value').then((snap) => {
            let reviews = snap.val()
            for (let key in reviews) {
                return this.fb.ref('publicReviews').child(key).update(this.data)
            }
        })
    }
}


class OverrideFromUid extends ReviewImpersonation {
    constructor(props) {
        super(props)
        this.data = {'fromUid': this.fbUser.uid}
    }
}


class OverrideReview extends ReviewImpersonation {
    constructor(props) {
        super(props)
        this.data = {'review': 'some text'}
    }
}


class OverrideToUid extends ReviewImpersonation {
    constructor(props) {
        super(props)
        this.data = {'toUid': 'xxx'}
    }
}
