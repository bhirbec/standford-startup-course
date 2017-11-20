import React from 'react'
import ReactDOM from 'react-dom'


class Feedbacks extends React.Component {
    constructor(props) {
        super(props)
        this.state = {feedbacks: []}
    }

    componentDidMount() {
        firebase.database().ref('feedback').once('value').then(snap => {
            let data = snap.val() || {}
            let feedbacks = []
            Object.keys(data).map(i => feedbacks.push(data[i]))
            this.setState({feedbacks: feedbacks})
        })
    }

    render() {
        return <div>
            <h1>Feedbacks</h1>

            <table className='tests'>
                <tbody>
                    <tr>
                        <th>Date</th>
                        <th>Email</th>
                        <th>Message</th>
                    </tr>
                    {this.state.feedbacks.map((r, i) => (
                        <tr key={`feedback-${i}`}>
                            <td>{r.date}</td>
                            <td>{r.email}</td>
                            <td>{r.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    }
}

export {Feedbacks}
