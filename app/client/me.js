import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import Multiselect from './multiselect'


class Me extends React.Component {
    constructor(props) {
        super(props)
        this.profileRef = firebase.database().ref('profile').child(this.props.user.uid)
    }

    render() {

        return <div className="container content-section-a">
            <div className="container">
                <div className="row">
                    <div className="clearfix"></div>
                    <Profile profileRef={this.profileRef} />
                </div>
            </div>
        </div>
    }
}

class Profile extends React.Component {

    componentDidMount() {
        this.props.profileRef.on('value', (snap) => {
            // TODO: understand whey snap.val() is null when the user sign in for the first time
            let val = snap.val()
            if (val != null) {
                this.setState(val)
            }
        })

        // TODO: try to reduce bandwidth with more scoped ref
        this.props.profileRef.on('child_changed', (snap) => {
            this.setState(snap.val())
        })
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience || [])

        return <div>
            <h1>{this.state['google-profile'].name}</h1>

            {refIds.map((refId) => {
                return <Experience
                    key={"exp-" + refId}
                    experienceRef={this.props.profileRef.child('experience/' + refId)}
                    data={this.state.experience[refId]} />
            })}

            {refIds.length < 5 ? <NewExperienceButton profileRef={this.props.profileRef} /> : null}
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
        this.props.experienceRef.set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    remove() {
        let b = confirm('Do you want to remove this work experience?')
        if (b == true) {
            this.props.experienceRef.remove()
        }
    }

    render() {
        return <div>
            <h3>{this.props.data.companyName} - {this.props.data.jobTitle}</h3>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Edit</button>
            <button type="button"
                className="btn btn-default"
                onClick={this.remove.bind(this)}>
                Remove</button>
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
        this.props.profileRef.child('experience').push().set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    onClick() {
        this.forceUpdate()
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
    }

    render() {
        return <div className="new-work-experience">
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

// TODO: set focus on first element
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

module.exports = Me