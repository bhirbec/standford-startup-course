import React from 'react'
import ReactDOM from 'react-dom'


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
                    <ReviewImpersonation
                        name='Review impersonation'
                        desc='Override "fromUid" field in a review'
                        expected='not allowed'
                        data={{'fromUid': this.props.fbUser.uid}}
                        run={this.state.run} />
                    <ReviewImpersonation
                        name='Review impersonation'
                        desc='Override "review" field in a review'
                        expected='not allowed'
                        data={{'review': 'some text'}}
                        run={this.state.run} />
                    <ReviewImpersonation
                        name='Review impersonation'
                        desc='Override "toUid" field in a review'
                        expected='not allowed'
                        data={{'toUid': 'xxx'}}
                        run={this.state.run} />
                </tbody>
            </table>
        </div>
    }
}


class WriteTest extends React.Component {
    constructor(props) {
        super(props)
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
    run() {
        return this.fb.ref('publicReviews').push().set({'x': true})
    }
}


class ReviewImpersonation extends WriteTest {
    run() {
        // TODO: would be nice to remove hard-coded value for testing.
        const reviewPath = 'publicReviews/-KrEcDQ9EOJNsbrQqYOc'
        return this.fb.ref(reviewPath).update(this.props.data)
    }
}
