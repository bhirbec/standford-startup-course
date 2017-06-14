import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
const Multiselect = require('./multiselect')

const config = window.__config

firebase.initializeApp(config.fbConfig)
const fb = firebase.database()

// https://jedwatson.github.io/react-select/
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html

class App extends React.Component {
    constructor (props) {
        super(props)
        this.state = {}
        this.ref = fb.ref('profile').child(config.userId)
    }

    componentDidMount() {
        this.ref.on('value', (snap) => {
            this.setState(snap.val())
        })

        this.ref.on('child_changed', (snap) => {
            this.setState(snap.val())
        })
    }

    handleForm(e) {
        let node = $(ReactDOM.findDOMNode(this))

        this.ref.child('experience').push().set({
            jobTitle: node.find('#job-title').val(),
            companyName: node.find('#company-name').val()
        }, function() {
            $(node).find('#myModal').modal('hide')
        })

        e.preventDefault()
    }

    render() {
        if (this.state['google-profile'] == undefined) {
            return <div>Loading...</div>
        }

        let experiences = []
        for (let e in this.state.experience) {
            experiences.push(this.state.experience[e])
        }

        return <div>
            <h1>{this.state['google-profile'].name}</h1>

            {experiences.map(function (exp, i) {
                return <div key={"exp-" + i}>
                    <h3>{exp.companyName} - {exp.jobTitle}</h3>
                </div>
            })}

            {function() {
                if (experiences.length < 5)
                    return <button type="button"
                        className="btn btn-default"
                        data-toggle="modal"
                        data-target="#myModal">+ Add work experience</button>
            }()}

            <div id="myModal" className="modal fade" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">
                                &times;
                            </button>
                            <h4 className="modal-title">
                                Add an experience and request feedback
                            </h4>
                        </div>
                        <form onSubmit={this.handleForm.bind(this)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="company-name">Company Name</label>
                                    <input id="company-name" type="text" className="form-control" placeholder="ex: Google" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="job-title">Job Title</label>
                                    <input id="job-title" type="text" className="form-control" placeholder="ex: Software Engineer" />
                                </div>
                                <div className="form-group">
                                    <label>Invite People to Comment your resume</label>
                                    <Multiselect title="Search your Google contacts" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-success">Save</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }
};

ReactDOM.render(<App />, document.getElementById('app'));
