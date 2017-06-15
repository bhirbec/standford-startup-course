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
        // TODO: try to reduce bandwidth with more scoped ref
        profileRef.on('child_changed', (snap) => {this.setState(snap.val())})
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience)

        return <div>
            <h1>{this.state['google-profile'].name}</h1>

            {refIds.map((refId) => {
                return <Experience key={"exp-" + refId} refId={refId} data={this.state.experience[refId]} />
            })}

            {refIds.length < 5 ? <NewExperienceButton /> : null}
        </div>
    }
};


class Experience extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    save(data) {
        // TODO: can we return a promise?
        let $node = $(ReactDOM.findDOMNode(this))
        profileRef.child('experience/' + this.props.refId).set(data, function() {
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
            <Modal title={'Edit work experience'}
                save={this.save.bind(this)}
                data={this.props.data} />
        </div>
    }
}

class NewExperienceButton extends React.Component {

    save(data) {
        // TODO: can we return a promise?
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
            <Modal title={'Add work experience'}
                save={this.save.bind(this)}
                data={{}} />
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
                        <h4 className="modal-title">{this.props.title}</h4>
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
