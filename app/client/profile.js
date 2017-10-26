import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'
import Avatar from 'material-ui/Avatar'

import NoMatch from './error'
import Form from './form'
import {postHashtagLike, pending} from './model'
import {Reviews} from './review'


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
        let hashtags = profile.hashtags || ""

        if (!hashtags) {
            return []
        }

        hashtags = hashtags.split(/[\r\n]+/)
        for (let i=0; i < hashtags.length; i++) {
            let name = hashtags[i]
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

            hashtags[i] = {name: name, likes: likes, unlikes: unlikes}
        }
        return hashtags
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

            {profile.companies && (
                <div className="hired-by">
                    <h3>Hired by </h3>
                    <div>
                        {profile.companies.split(/[\r\n]+/).map((c) => {
                            return <div key={"c-" + c} className="hashtag">{c}</div>
                        })}
                    </div>
                </div>
            )}

            {hashtags && (
                <div>
                    <h3>Skills</h3>
                    <div>
                        {hashtags.map((hashtag) => {
                            return <div className="hashtag" key={"hashtag-" + hashtag.name}>
                                {hashtag.name}
                                <Hashlike
                                    profileId={this.props.profileId}
                                    fbUser={this.props.fbUser}
                                    hashtag={hashtag}
                                    stagePendingLike={this.stagePendingLike.bind(this)} />
                            </div>
                        })}
                    </div>
                </div>
            )}

            {profile.intro && (
                <div className="intro">
                    <h3>About me</h3>
                    <p>&ldquo;{profile.intro}&rdquo;</p>
                </div>
            )}

            <Reviews {...this.props} />
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
            this.setState(state)
        })
    }

    onSubmit(formData) {
        let required = ['firstname', 'lastname', 'occupation', 'hashtags']
        for (let i = 0; i < required.length; i++) {
            let field = required[i]
            if (!formData[field]) {
                this.setState({error: `"${field}" field can not be empty.`})
                return
            }
        }

        let data = {}
        data['identity/firstname'] = formData.firstname
        data['identity/lastname'] = formData.lastname
        data['hashtags'] = formData.hashtags.trim()
        data['companies'] = formData.companies.trim()
        data['intro'] = formData.intro
        data['location'] = formData.location
        data['school'] = formData.school
        data['occupation'] = formData.occupation

        let path = `profile/${this.props.profileId}/view`
        firebase.database().ref(path).update(data).then(() => {
            this.setState({'redirect': (this.props.redirectUri || '/me')})
        })
    }

    render() {
        if (this.state == null) {
            return null
        }

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return <div className="experience-form">
            <h1>{this.props.title || "Your Profile"}</h1>
            <Form onSubmit={this.onSubmit.bind(this)} data={this.state || {}}>
                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}

                <div className="form-group">
                    <label htmlFor="firstname">First name:</label>
                    <input id="firstname"
                        name="firstname"
                        type="text"
                        className="form-control" />
                </div>

                <div className="form-group">
                    <label htmlFor="lastname">Last name:</label>
                    <input id="lastname"
                        name="lastname"
                        type="text"
                        className="form-control" />
                </div>

                <div className="form-group">
                    <label htmlFor="intro">Your intro in 200 characters:</label>
                    <textarea id="intro"
                        name="intro"
                        className="form-control"
                        rows={6}
                        placeholder={
                            "Example:\nI'm currently working as Intern at Microsoft and I'm looking " +
                            "for a permanent position as Software Engineer. I'm proeficient " +
                            "at C++, Python, and MySQL."
                        } />
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input id="location"
                        name="location"
                        type="text"
                        className="form-control"
                        placeholder="Example: New York, San Diego, San Francisco..." />
                </div>
                <div className="form-group">
                    <label htmlFor="school">School & Degree:</label>
                    <input id="school"
                        name="school"
                        type="text"
                        className="form-control"
                        placeholder="Example: UCSD" />
                </div>
                <div className="form-group">
                    <label htmlFor="occupation">Current/Last occupation:</label>
                    <input id="occupation"
                        name="occupation"
                        type="text"
                        className="form-control"
                        placeholder="Example: Software Engineer, Student, CEO of Tesla" />
                </div>
                <div className="form-group">
                    <label htmlFor="companies">Last companies your worked for (one entry per line):</label>
                    <textarea id="company-name"
                        name="companies"
                        className="form-control"
                        rows={6}
                        placeholder={
                            "Example:\nFacebook (2010 to present)\n" +
                            "Google (2005 to 2010)\n"
                        } />
                </div>
                <div className="form-group">
                    <label htmlFor="hashtags">Enter hashtags (one entry per line):</label>
                    <textarea id="hashtags"
                        name="hashtags"
                        className="form-control"
                        rows={10}
                        placeholder={"Example:\nJava\nC++\nCTO"} />
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


export {MyProfile, Profile, ProfileForm}
