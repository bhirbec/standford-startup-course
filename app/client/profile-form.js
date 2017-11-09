import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect} from 'react-router-dom'

import {UserAvatar} from './common'
import Form from './form'
import {pending} from './model'


export default class ProfileForm extends React.Component {
    componentDidMount() {
        let fb = firebase.database()
        let ref = fb.ref('profile').child(this.props.profileId).child('view')
        // TODO: wait for backend to create profile/$uid/form
        ref.once('value', (snap) => {
            let state = snap.val() || {}
            state['firstname'] = state.identity ? state.identity.firstname : ''
            state['lastname'] = state.identity ? state.identity.lastname : ''
            state['photoURL'] = state.identity ? state.identity.photoURL : ''
            state['hashtags'] = mapToStr(state.hashtags || {})
            state['companies'] = mapToStr(state.companies || {})
            this.setState(state)
        })
    }

    onSubmit(formData) {
        let required = ['firstname', 'lastname', 'hashtags']
        for (let i = 0; i < required.length; i++) {
            let field = required[i]
            if (!formData[field]) {
                window.scrollTo(0, 0)
                this.setState({error: `"${field}" field can not be empty.`})
                return
            }
        }

        let data = {}
        data['view/identity/firstname'] = formData.firstname
        data['view/identity/lastname'] = formData.lastname
        data['view/hashtags'] = strToMap(formData.hashtags)

        if (formData.photoURL)
            data['view/identity/photoURL'] = formData.photoURL

        if (formData.companies) {
            data['view/companies'] = strToMap(formData.companies)
        } else {
            data['view/companies'] = null
        }

        data['view/intro'] = formData.intro || null
        data['view/location'] = formData.location || null
        data['view/school'] = formData.school || null
        data['view/occupation'] = formData.occupation || 'Open to new opportunities'
        data['onboarded'] = true

        let path = `profile/${this.props.profileId}`

        try {
            firebase.database().ref(path).update(data).then(() => {
                // flush pending action after onboarding
                let redirectURI = pending.flush(this.props.fbUser)
                this.setState({redirect: redirectURI || '/me'})
            })
        } catch (err) {
            this.setState({error: err.message})
        }
    }

    onTouchTap(e) {
        e.preventDefault()
        $(ReactDOM.findDOMNode(this)).find('form').submit()
    }

    render() {
        if (this.state == null) {
            return null
        }

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return <div className="me">
            <h1>{this.props.title || "Your Profile"}</h1>
            <p>* required field</p>
            <Form onSubmit={this.onSubmit.bind(this)} data={this.state || {}}>
                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}

                <div className="form-group">
                    <label htmlFor="firstname">First name *</label>
                    <input id="firstname"
                        name="firstname"
                        type="text"
                        className="form-control" />
                </div>

                <div className="form-group">
                    <label htmlFor="lastname">Last name *</label>
                    <input id="lastname"
                        name="lastname"
                        type="text"
                        className="form-control" />
                </div>

                <PhotoUploader
                    fbUser={this.props.fbUser}
                    photoURL={this.state.photoURL}
                    firstname={this.state.firstname} />

                <div className="form-group">
                    <label htmlFor="hashtags">Enter keywords to get discovered and up-voted (one entry per line) *</label>
                    <textarea id="hashtags"
                        name="hashtags"
                        className="form-control"
                        rows={10}
                        placeholder={"Marketing\nCommunication\nSales\nHTML\nExcel\nWeb Design\netc"} />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input id="location"
                        name="location"
                        type="text"
                        className="form-control"
                        placeholder="New York, San Diego, San Francisco, etc" />
                </div>
                <div className="form-group">
                    <label htmlFor="school">School & Degree</label>
                    <input id="school"
                        name="school"
                        type="text"
                        className="form-control"
                        placeholder="UCSD" />
                </div>
                <div className="form-group">
                    <label htmlFor="occupation">Occupation</label>
                    <input id="occupation"
                        name="occupation"
                        type="text"
                        className="form-control"
                        placeholder="Student, CEO, Open to new opportunities, etc" />
                </div>
                <div className="form-group">
                    <label htmlFor="companies">Companies that have hired you (one entry per line)</label>
                    <textarea id="company-name"
                        name="companies"
                        className="form-control"
                        rows={6}
                        placeholder={
                            "Facebook (2010 to present)\n" +
                            "Google (2005 to 2010)\n" +
                            "etc"
                        } />
                </div>
                <div className="form-group">
                    <label htmlFor="intro">Your elevator pitch in 30 seconds</label>
                    <textarea id="intro"
                        name="intro"
                        className="form-control"
                        rows={6}
                        placeholder={
                            "I'm currently working as an Intern at Apple, and I'm looking " +
                            "for a permanent position as a Product Manager in Technology. " +
                            "I'm hard working, a quick learner, and have a Degree in Computer " +
                            "Science from UCSD."
                        } />
                </div>
                <div>
                    <button
                        type="submit"
                        onTouchTap={this.onTouchTap.bind(this)}
                        className="btn btn-success">Save</button>
                    <Link to="/me">
                        <button type="button" className="btn btn-default">Back</button>
                    </Link>
                </div>
            </Form>
        </div>
    }
}


class PhotoUploader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            photoURL: this.props.photoURL,
            firstname: this.props.firstname,
            progress: 0,
            open: false
        }
    }

    open(e) {
        e.preventDefault()
        this.setState({open: true, progress: 0, error: null})
    }

    close(e) {
        e.preventDefault()
        this.setState({open: false, error: null})
    }

    upload(e) {
        let file = e.target.files[0]

        if (!this.validate(file.name)) {
            this.setState({error: "Format not supported."})
            return
        }

        // TODO: clean up previous photo
        let ref = firebase.storage().ref(`/photo/${this.props.fbUser.uid}/${file.name}`)
        let task = ref.put(file)

        task.on('state_changed', snap => {
            let progress = (snap.bytesTransferred / snap.totalBytes)*100
            this.setState({progress: progress, error: null})
        }, err => {
            this.setState({error: "Upload failed - " + err.message})
        }, () => {
            let photoURL = task.snapshot.downloadURL
            this.setState({photoURL: photoURL, open: false})
        })
    }

    validate(filename) {
        let extensions = [".jpg", ".jpeg", ".png"]

        for (let i = 0; i < extensions.length; i++) {
            let ext = extensions[i];
            if (filename.substr(filename.length - ext.length, ext.length).toLowerCase() == ext.toLowerCase()) {
                return true
            }
        }

        return false
    }

    render() {
        let identity = {
            photoURL: this.state.photoURL,
            firstname: this.state.firstname,
        }

        return <div className="form-group">
            <input type="hidden" name="photoURL" value={this.state.photoURL} />

            {this.state.error && (
                <div className="form-error">{this.state.error}</div>
            )}

            {this.state.open && (
                <span>
                    <label htmlFor="hashtags">Upload a picture (PNG or JPEG format, max of 1MB):</label>
                    <input type="file" accept="image/*" onChange={this.upload.bind(this)} />
                    <progress id="uploader" value={this.state.progress} max="100">{this.state.progress}%</progress>
                    <a href="#" onClick={this.close.bind(this)}>Close</a>
                </span>
            )}
            {!this.state.open && (
                <span>
                    <UserAvatar identity={identity} size={50} />
                    <a href="#" onClick={this.open.bind(this)}>Change picture</a>
                </span>
            )}
        </div>
    }
}


let strToMap = (str) => {
    let out = {}
    let list = str.trim().split(/[\r\n]+/)
    list.forEach((h, i) => out[h] = true)
    return out
}

let mapToStr = (m) => {
    return Object.keys(m).join('\r\n')
}
