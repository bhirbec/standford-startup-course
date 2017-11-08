import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'
import Avatar from 'material-ui/Avatar'

import NoMatch from './error'
import {UserAvatar} from './common'
import Form from './form'
import {postHashtagLike, pending} from './model'
import {Reviews} from './review'
import SocialButtons from './social'


class MyProfile extends React.Component {
    render() {
        // TODO: move routes to app.js?
        return <div>
            <Route exact path="/me" render={() => (
                <Profile {...this.props} />
            )} />
            <Route exact path="/me/edit" render={() => (
                <ProfileForm {...this.props} />
            )} />
        </div>
    }
}


class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {profile: this.props.serverData}
    }

    componentDidMount() {
        this.fetch(this.props.profileId)
    }

    componentWillReceiveProps(nextProps) {
        if (this.fbRef) {
            this.fbRef.off()
        }

        this.fetch(nextProps.profileId)
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    fetch(uid) {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        this.fbRef = fb.ref('profile').child(uid).child('view')

        this.fbRef.on('value', (snap) => {
            if (!snap.exists()) {
                this.setState({'notfound': true})
                return
            }

            // TODO: understand why snap.val() is null when the user signs in for the first time
            let profile = snap.val()
            if (profile == null) {
                return
            }

            this.setState({'profile': profile})
        })
    }

    buildHashtags() {
        let profile = this.state.profile || {}
        let taglikes = profile.like || {}

        return Object.keys(profile.hashtags || {}).map(name => {
            let likes = 0
            let unlikes = 0

            let hlikes = taglikes[name] || {}
            for (let uid in hlikes) {
                if (hlikes[uid] == -1) {
                    unlikes += 1
                } else {
                    likes += 1
                }
            }

            return {name: name, likes: likes, unlikes: unlikes}
        })
    }

    stagePendingLike(hashtag, value) {
        pending.stageHashtagLike(this.props.profileId, hashtag, value)
        this.setState({redirect: '/signup'})
    }

    render() {
        if (!this.state.profile) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        } else if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        let fbUser = this.props.fbUser || undefined
        let profile = this.state.profile || {}
        let pub = profile.public || {}
        let hashtags = this.buildHashtags()
        let companies = Object.keys(profile.companies || {})
        let profileName = `${profile.identity.firstname} ${profile.identity.lastname}`

        return <div className="me">
            <div className="profile-header">
                <h1 className="main-color">
                    {(this.props.fbUser && this.props.fbUser.uid == this.props.profileId) ?
                        <Link to={'/me/edit'} className="main-color">
                            {profileName}
                            <i className="material-icons main-color" title="Edit your profile">edit</i>
                        </Link>
                        :
                        <span>{profileName}</span>
                    }
                </h1>
                {profile.occupation && (
                    <h2>{profile.occupation}</h2>
                )}
                {profile.identity.photoURL && (
                    <Avatar src={profile.identity.photoURL} size={90} />
                )}
                {profile.location && (
                    <div className="location">
                        <i className="material-icons">location_on</i>{profile.location}
                    </div>
                )}
                {(profile.school) && (
                    <div className="school clearfix">
                        <i className="material-icons">school</i>{profile.school}
                    </div>
                )}

                <SocialButtons
                    profileId={this.props.profileId}
                    title={`Checkout ${profile.identity.firstname} on LetsResume`} />
            </div>

            {(fbUser === undefined || fbUser.uid !== this.props.profileId) && (
                <div className="profile-actions">
                    <Link to={`/message/${this.props.profileId}`}>
                        {/* TODO: implement send and signup flow */}
                        <button type="submit" className="btn btn-success">
                            <i className="material-icons" title="Send a message">message</i>Contact
                        </button>
                    </Link>

                    <Link to={`/in/${this.props.profileId}/review/new`}>
                        <button type="button" className="btn btn-default">
                            <i className="material-icons" title="Send a message">edit</i>Review
                        </button>
                    </Link>
                </div>
            )}

            {companies.length > 0 && (
                <div className="hired-by">
                    <h3>Hired by </h3>
                    <div>
                        {companies.map(c =>
                            <div key={"c-" + c} className="hashtag">{c}</div>
                        )}
                    </div>
                </div>
            )}

            {hashtags.length > 0 && (
                <div>
                    <h3>Votes by the crowd</h3>
                    <div>
                        {hashtags.map(hashtag => (
                            <div className="hashtag" key={"hashtag-" + hashtag.name}>
                                {hashtag.name}
                                <Hashlike
                                    profileId={this.props.profileId}
                                    fbUser={this.props.fbUser}
                                    hashtag={hashtag}
                                    stagePendingLike={this.stagePendingLike.bind(this)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {profile.intro && (
                <div className="intro">
                    <h3>About me</h3>
                    <p>&ldquo;{profile.intro}&rdquo;</p>
                </div>
            )}

            <Reviews {...this.props} reviews={this.state.profile.reviewsReceived} />
        </div>
    }
}


class ProfileForm extends React.Component {
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
                this.setState({error: `"${field}" field can not be empty.`})
                return
            }
        }

        let data = {}
        data['view/identity/firstname'] = formData.firstname
        data['view/identity/lastname'] = formData.lastname
        if (formData.photoURL)
            data['view/identity/photoURL'] = formData.photoURL
        data['view/hashtags'] = strToMap(formData.hashtags)
        data['view/companies'] = strToMap(formData.companies)
        data['view/intro'] = formData.intro
        data['view/location'] = formData.location
        data['view/school'] = formData.school
        data['view/occupation'] = formData.occupation || 'Open to new opportunities'
        data['onboarded'] = true

        let path = `profile/${this.props.profileId}`
        firebase.database().ref(path).update(data).then(() => {
            // flush pending action after onboarding
            let redirectURI = pending.flush(this.props.fbUser)
            this.setState({redirect: redirectURI || '/me'})
        })
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

class Hashlike extends React.Component {
    onClick(value, e) {

        if (!this.props.fbUser) {
            this.props.stagePendingLike(this.props.hashtag.name, value)
            return
        }

        let p = this.props
        postHashtagLike(p.fbUser, p.profileId, p.hashtag.name, value)
        e.preventDefault()
    }

    render() {
        return <span>
            <span onClick={this.onClick.bind(this, 1)} className="likes">
                <i className="material-icons">thumb_up</i>
                {this.props.hashtag.likes}
            </span>
            <span onClick={this.onClick.bind(this, -1)} className="unlikes">
                <i className="material-icons">thumb_down</i>
                {this.props.hashtag.unlikes}
            </span>
        </span>
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


export {MyProfile, Profile, ProfileForm}
