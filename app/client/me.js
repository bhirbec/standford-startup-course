import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import {Link} from 'react-router-dom'

import Multiselect from './multiselect'
import {currentUser} from './auth'
// TODO: do we need BaseForm?
import {BaseForm} from './form'


class Me extends React.Component {
    constructor(props) {
        super(props)
        this.fbUser = currentUser()
    }

    componentDidMount() {
        // we put this here (and not in constructor) for server-side rendering
        this.fbRef = firebase.database().ref('profile').child(this.fbUser.uid)

        this.fbRef.on('value', (snap) => {
            // TODO: understand why snap.val() is null when the user signs in for the first time
            let val = snap.val()
            if (val != null) {
                val.experience = val.experience || []
                this.setState(val)
            }
        })
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience || [])

        return <div className="me">
            <div>View your <Link to={'/in/' + this.fbUser.uid}>public profile</Link></div>

            <h1>{this.state['info'].firstname} {this.state['info'].lastname}</h1>

            {refIds.map((refId) => {
                return <Experience
                    key={"exp-" + refId}
                    experienceRef={this.fbRef.child('experience/' + refId)}
                    data={this.state.experience[refId]} />
            })}

            {refIds.length < 5 ? <NewExperienceButton profileRef={this.fbRef} /> : null}
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
        return <div className="job-experience">
            <h3>{this.props.data.companyName} - {this.props.data.jobTitle}</h3>

            {this.props.data.jobStartDate || this.props.data.jobEndDate ?
                <div className="job-dates">
                    {this.props.data.jobStartDate} to {this.props.data.jobEndDate || 'present'}
                </div>
            :
                null
            }
            <p className="job-description">
                {this.props.data.jobDescription}
            </p>
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

class Modal extends BaseForm {


    handleForm(e) {
        let data = this.formData();
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
                                <input id="company-name"
                                    name="companyName"
                                    type="text"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="ex: Google" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-title">Job Title</label>
                                <input id="job-title"
                                    name="jobTitle"
                                    type="text"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="ex: Software Engineer" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea id="job-description"
                                    name="jobDescription"
                                    rows={'4'}
                                    ref={this.setValue.bind(this)}
                                    className="form-control"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-start-date">Start Date</label>
                                <input id="job-start-data"
                                    name="jobStartDate"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="mm/yyyy" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="job-end-date">End Date (leave empty for current position)</label>
                                <input id="job-end-data"
                                    name="jobEndDate"
                                    ref={this.setValue.bind(this)}
                                    className="form-control"
                                    placeholder="mm/yyyy" />
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
