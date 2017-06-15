import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
const Multiselect = require('./multiselect')

const config = window.__config

firebase.initializeApp(config.fbConfig)
const fb = firebase.database()
const profileRef = fb.ref('profile').child(config.userId)

// https://jedwatson.github.io/react-select/
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html

class App extends React.Component {

    componentDidMount() {
        profileRef.on('value', (snap) => { this.setState(snap.val())})
        profileRef.on('child_changed', (snap) => {this.setState(snap.val())})
    }

    render() {
        if (this.state == null) {
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
                return <Experience key={"exp-" + exp.refId} data={exp} />
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

    save(data) {
        let $node = $(ReactDOM.findDOMNode(this))
        // TODO: merge this ref
        let ref = profileRef.child('experience/' + this.props.data.refId)
        ref.set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    render() {
        return <div>
            <h3>{this.props.data.companyName} - {this.props.data.jobTitle}</h3>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Edit</button>
            <Modal save={this.save.bind(this)} data={this.props.data} />

        </div>
    }
}

class NewExperienceButton extends React.Component {

    save(data) {
        // TODO: merge this
        let $node = $(ReactDOM.findDOMNode(this))
        profileRef.child('experience').push().set(data, function() {
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
            <Modal save={this.save.bind(this)} data={{}} />
        </div>
    }
}


class Modal extends React.Component {

    setValue(input) {
        if (input) {
            input.value = this.props.data[input.name] || ''
        }
    }

    handleForm(e) {
        let $form = $(ReactDOM.findDOMNode(this)).find('form')

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        this.props.save(data)
        e.preventDefault()
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
                    <form onSubmit={this.handleForm.bind(this)}>
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
