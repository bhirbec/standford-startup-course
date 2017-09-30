import {convertToRaw, EditorState} from 'draft-js';
import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'

import {Editor, ReadOnlyEditor, makeEditorState} from './editor'
import Form from './form'


class Experience extends React.Component {
    render() {
        let exp = this.props.exp

        return <div className="job-experience">
            <h3>{exp.companyName} - {exp.jobTitle}</h3>

            {(exp.jobStartDate || exp.jobEndDate) && (
                <div className="job-dates">
                    {exp.jobStartDate} to {exp.jobEndDate || 'present'}
                </div>
            )}

            <div className="job-description">
                <ReadOnlyEditor content={exp.jobDescription} />
            </div>

            {this.props.children}
        </div>
    }
}


class EditableExperience extends React.Component {
    remove() {
        // TODO: remove reviews?
        let b = confirm('Do you want to remove this work experience?')
        if (b == true) {
            firebase.database().ref('profile')
                .child(this.props.profileId)
                .child('experience')
                .child(this.props.expId)
                .remove()
        }
    }

    render() {
        return <Experience {...this.props}>
            <Link to={'/me/experience/' + this.props.expId}>
                <button type="button" className="btn btn-default">Edit</button>
            </Link>

            <button type="button"
                className="btn btn-default"
                onClick={this.remove.bind(this)}>
                Remove</button>
        </Experience>
    }
}


class ExperienceForm extends React.Component {
    constructor(props) {
        super(props)

        if (this.props.expId) {
            this.state = null
        } else {
            this.state = {editorState: EditorState.createEmpty()}
        }
    }

    componentDidMount() {
        if (this.props.expId) {
            let fb = firebase.database()
            let ref = fb.ref('profile/' + this.props.fbUser.uid + '/experience/' + this.props.expId)
            ref.once('value').then((snap) => {
                let data = snap.val()
                data.editorState = makeEditorState(data.jobDescription)
                this.setState(data)
            })
        }
    }

    onSubmit(data) {
        if (!this.validate(data)) {
            return
        }

        let fb = firebase.database()
        let ref = fb.ref('profile').child(this.props.fbUser.uid).child('experience')

        let p
        if (this.props.expId) {
            p = ref.child(this.props.expId).set(data)
        } else {
            p = ref.push().set(data)
        }

        p.then(() => {
            this.setState({'redirect': '/me'})
        })
    }

    validate(data) {
        if (data.companyName == "") {
            this.setState({error: "Company name can not be empty"})
            return false
        }

        if (data.jobTitle == "") {
            this.setState({error: "Job title can not be empty"})
            return false
        }

        let content = this.state.editorState.getCurrentContent()

        if (!content.hasText()) {
            this.setState({error: "Job description can not be empty"})
            return false
        } else {
            data.jobDescription = convertToRaw(content)
        }

        if (data.jobStartDate == "") {
            this.setState({error: "Start date can not be empty"})
            return false
        }
        return true
    }

    onChangeEditor(editorState) {
        this.setState({editorState: editorState})
    }

    render() {
        if (this.state == null) {
            return null
        }

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return <div className="experience-form">
            {this.props.expId == undefined ?
                <h1>New Work Experience</h1>
                :
                <h1>{this.state.companyName} - {this.state.jobTitle}</h1>
            }

            <Form onSubmit={this.onSubmit.bind(this)} data={this.state}>
                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="company-name">Company Name</label>
                    <input id="company-name"
                        name="companyName"
                        type="text"
                        className="form-control"
                        placeholder="ex: Google" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-title">Job Title</label>
                    <input id="job-title"
                        name="jobTitle"
                        type="text"
                        className="form-control"
                        placeholder="ex: Software Engineer" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-description">Job Description</label>
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChangeEditor.bind(this)} />
                </div>
                <div className="form-group">
                    <label htmlFor="job-start-date">Start Date</label>
                    <input id="job-start-data"
                        name="jobStartDate"
                        type="text"
                        className="form-control"
                        placeholder="mm/yyyy" />
                </div>
                <div className="form-group">
                    <label htmlFor="job-end-date">End Date (leave empty for current position)</label>
                    <input id="job-end-data"
                        name="jobEndDate"
                        type="text"
                        className="form-control"
                        placeholder="mm/yyyy" />
                </div>
                <div>
                    <button type="submit" className="btn btn-success">Save</button>
                    <Link to="/me">
                        <button type="button" className="btn btn-default">Back</button>
                    </Link>
                </div>
            </Form>
        </div>
    }
}

export {Experience, EditableExperience, ExperienceForm}
