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

    render() {
        if (this.state['google-profile'] == undefined) {
            return <div>Loading...</div>
        }

        let experiences = []
        for (let e in this.state.experience) {
            this.state.experience[e].refId = e
            experiences.push(this.state.experience[e])
        }

        return <div>
            <h1>{this.state['google-profile'].name}</h1>

            {experiences.map(function (exp, i) {
                return <Experience key={"exp-" + exp.refId} exp={exp} />
            })}

            {experiences.length < 5 ? <NewExperienceButton /> : null}
        </div>
    }
};


class Experience extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    handleForm(e) {
        let $node = $(ReactDOM.findDOMNode(this))
        let $form = $node.find('form')

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        this.save(data)
        e.preventDefault()
    }

    save(data) {
        let $node = $(ReactDOM.findDOMNode(this))
        // TODO: merge this ref
        let ref = fb.ref('profile/' + config.userId + '/experience/' + this.props.exp.refId)
        ref.set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    render() {
        return <div>
            <h3>{this.props.exp.companyName} - {this.props.exp.jobTitle}</h3>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Edit</button>
            <Modal handleForm={this.handleForm.bind(this)}
                companyName={this.props.exp.companyName}
                jobTitle={this.props.exp.jobTitle} />
        </div>
    }
}

class NewExperienceButton extends React.Component {

    handleForm(e) {
        let $node = $(ReactDOM.findDOMNode(this))
        let $form = $node.find('form')

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        this.save(data)
        e.preventDefault()
    }

    save(data) {
        // TODO: merge this
        let $node = $(ReactDOM.findDOMNode(this))
        let ref = fb.ref('profile').child(config.userId)
        ref.child('experience').push().set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    onClick() {
        this.forceUpdate()
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
    }

    render() {
        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                + Add work experience</button>
            <Modal handleForm={this.handleForm.bind(this)}
                companyName={''}
                jobTitle={''} />
        </div>
    }
}


class Modal extends React.Component {

    setValue(input) {
        if (input) {
            input.value = this.props[input.name]
        }
    }

    render() {
        return <div className="modal fade" role="dialog">
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
                    <form onSubmit={this.props.handleForm}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="company-name">Company Name</label>
                                <input name="companyName"
                                       type="text"
                                       ref={this.setValue.bind(this)}
                                       className="form-control"
                                       placeholder="ex: Google" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-title">Job Title</label>
                                <input name="jobTitle"
                                       type="text"
                                       ref={this.setValue.bind(this)}
                                       className="form-control"
                                       placeholder="ex: Software Engineer" />
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
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
