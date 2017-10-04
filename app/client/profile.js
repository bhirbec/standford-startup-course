import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'

import NoMatch from './error'
import {EditableExperience, Experience, ExperienceForm} from './experience'
import Form from './form'
import {Reviews} from './review'


class MyProfile extends React.Component {
    render() {
        // TODO: move routes to app.js
        return <div>
            <Route exact path="/me" render={() => (
                <Profile fbUser={this.props.fbUser} profileId={this.props.fbUser.uid} />
            )} />
            <Route exact path="/me/edit" render={() => (
                <ProfileForm fbUser={this.props.fbUser} profileId={this.props.fbUser.uid} />
            )} />
        </div>
    }
}


class BaseProfile extends React.Component {
    componentDidMount() {
        this.fetch(this.props.profileId)
    }

    componentWillUnmount() {
        this.fbRef.off()
    }

    fetch(uid) {
        // we put this here (and not in constructor) for server-side rendering
        let fb = firebase.database()
        this.fbRef = fb.ref('profile').child(uid)

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

            this.setState(profile)
        })
    }

    buildHashtags() {
        let taglikes = this.state.like || {}
        let hashtags = (this.state.public || {}).hashtags || ""

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

    renderProfile() {
        let pub = this.state.public || {}
        let hashtags = this.buildHashtags()
        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            <h1 className="main-color">{profileName}</h1>
            {hashtags && (
                <div className="skills">
                    {hashtags.map((hashtag) => {
                        return <div className="hashtag" key={"hashtag-" + hashtag.name}>
                            {hashtag.name}
                            <Hashlike
                                profileId={this.props.profileId}
                                fbUser={this.props.fbUser}
                                hashtag={hashtag} />
                        </div>
                    })}
                </div>
            )}

            {pub.intro && (
                <div className="intro">&ldquo;{pub.intro}&rdquo;</div>
            )}

            {pub.occupation && (
                <h2>{pub.occupation}</h2>
            )}

            {pub.companies && (<div className="companies clearfix">
                <div>Worked at</div>
                {pub.companies.split(/[\r\n]+/).map((c) => {
                    return <div key={"c-" + c} className="hashtag">{c}</div>
                })}
            </div>)}
        </div>
    }
}

class Hashlike extends React.Component {
    onClick(value, e) {
        this.props.fbUser.getIdToken().then(idToken => {
            let fb = firebase.database()
            fb.ref('likeQueue').push().set({
                toUid: this.props.profileId,
                fromUid: this.props.fbUser.uid,
                idToken: idToken,
                hashtag: this.props.hashtag.name,
                value: value
            })
        })
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

class Profile extends BaseProfile {
    render() {
        if (!this.state) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        }

        return <div>
            <div>
                View your <Link to={'/in/' + this.props.profileId}>public profile</Link>
            </div>

            {this.renderProfile()}

            <div className="new-work-experience">
                <Link to={'/me/edit'}>
                    <button type="button" className="btn btn-default">Edit</button>
                </Link>
            </div>
            <Reviews {...this.props} />
        </div>
    }
}


class PublicProfile extends BaseProfile {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentWillReceiveProps(nextProps) {
        if (this.fbRef) {
            this.fbRef.off()
        }
        this.fetch(nextProps.profileId)
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        }

        let profileName = `${this.state.info.firstname} ${this.state.info.lastname}`

        return <div className="me">
            {this.renderProfile()}

            {/* TODO: we should be able to remove profileName
            param when moving review form on another url */}
            <Reviews
                fbUser={this.props.fbUser}
                profileName={profileName}
                profileId={this.props.profileId} />
        </div>
    }
}


class ProfileForm extends React.Component {
    componentDidMount() {
        let fb = firebase.database()
        let ref = fb.ref('profile').child(this.props.profileId).child('public')
        ref.once('value', (snap) => {
            this.setState(snap.val() || {})
        })
    }

    onSubmit(data) {
        if (data.occupation == "") {
            this.setState({error: '"Occupation" field can not be empty.'})
            return
        }

        if (data.hashtags == "") {
            this.setState({error: '"Hashtags" field can not be empty.'})
            return
        }

        let fb = firebase.database()
        let ref = fb.ref('profile').child(this.props.profileId).child('public')

        ref.set(data).then(() => {
            this.setState({'redirect': '/me'})
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
            <h1>Your Profile</h1>
            <Form onSubmit={this.onSubmit.bind(this)} data={this.state || {}}>
                {this.state.error && (
                    <div className="form-error">{this.state.error}</div>
                )}
                <div className="form-group">
                    <label htmlFor="intro">Your intro in 200 characters:</label>
                    <textarea id="intro"
                        name="intro"
                        className="form-control"
                        rows={6}
                        placeholder={
                            "Example:\nI'm current working as Intern at Microsoft and I'm looking " +
                            "for a permanent position as Software Engineer. I'm proeficient " +
                            "at C++, Python, and MySLQ."
                        } />
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

export {MyProfile, PublicProfile}