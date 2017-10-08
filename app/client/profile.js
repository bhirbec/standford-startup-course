import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'

import {SignupComponent, LoginComponent} from './auth'
import NoMatch from './error'
import {EditableExperience, Experience, ExperienceForm} from './experience'
import Form from './form'
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

        // this is triggered when the user signs up after a hashtag vote
        if (!this.props.fbUser && nextProps.fbUser) {
            // send any pending like
            if (this.pendingLike) {
                postHashtagLike(
                    nextProps.fbUser,
                    this.props.profileId,
                    this.pendingLike.hashtag,
                    this.pendingLike.value
                )
                this.pendingLike = undefined
            }

            // We make sure to show the profile after a login/singup
            this.setState({mode: 'profile'})
        }

        this.fetch(nextProps.profileId)
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

            this.setState({'profile': profile})
        })
    }

    buildHashtags() {
        let profile = this.state.profile || {}
        let taglikes = profile.like || {}
        let hashtags = (profile.public || {}).hashtags || ""

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

    stagePendingLike(pendingLike) {
        this.pendingLike = pendingLike
        this.setState({mode: 'signup'})
    }

    changeMode(mode, e) {
        e.preventDefault()
        this.setState({mode: mode})
    }

    render() {
        if (!this.state.profile) {
            return <div>Loading...</div>
        } else if (this.state.notfound) {
            return <NoMatch />
        }

        let comp
        if (this.state.mode == 'signup') {
            comp = this.signup()
        } else if (this.state.mode == 'login') {
            comp = this.login()
        } else {
            comp = this.profile()
        }

        return comp
    }

    profile() {
        let profile = this.state.profile || {}
        let pub = profile.public || {}
        let hashtags = this.buildHashtags()
        let profileName = `${profile.info.firstname} ${profile.info.lastname}`

        return <div className="me">
            {this.props.me && (
                <div>
                    View your <Link to={'/in/' + this.props.profileId}>public profile</Link>
                </div>
            )}

            <div>
                <h1 className="main-color">{profileName}</h1>
                {(pub.occupation || pub.location || pub.companies) && (
                    <div className="title clearfix">
                        {pub.occupation && (
                            <h2>{pub.occupation}</h2>
                        )}
                        {pub.companies && (
                            <div className="clearfix">
                                <span>worked @ </span>
                                {pub.companies.split(/[\r\n]+/).map((c) => {
                                    return <div key={"c-" + c} className="hashtag">{c}</div>
                                })}
                            </div>
                        )}
                        {(pub.location || pub.degree) && (
                            <div className="minor-stuff clearfix">
                                {pub.school && (
                                    <span>
                                        <i className="material-icons">school</i>{pub.school}
                                    </span>
                                )}
                                {pub.location && (
                                    <span>
                                        <i className="material-icons">location_on</i>{pub.location}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {hashtags && (
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
            )}

            {pub.intro && (
                <div className="intro">&ldquo;{pub.intro}&rdquo;</div>
            )}

            {this.props.me && (
                <div className="new-work-experience">
                    <Link to={'/me/edit'}>
                        <button type="button" className="btn btn-default">Edit</button>
                    </Link>
                </div>
            )}

            <Reviews {...this.props} />
        </div>
    }

    signup() {
        return <SignupComponent
            title="Sign up to post your vote"
            onClickLogin={this.changeMode.bind(this, 'login')} />
    }

    login() {
        return <LoginComponent
            title="Log in to post your vote"
            onClickSignup={this.changeMode.bind(this, 'signup')} />
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
        e.preventDefault()

        if (!this.props.fbUser) {
            this.props.stagePendingLike({hashtag: this.props.hashtag.name, value: value})
            return
        }

        let p = this.props
        postHashtagLike(p.fbUser, p.profileId, p.hashtag.name, value)
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

function postHashtagLike(fbUser, profileId, hashtag, value) {
    return fbUser.getIdToken().then(idToken => {
        let fb = firebase.database()
        return fb.ref('likeQueue').push().set({
            toUid: profileId,
            fromUid: fbUser.uid,
            idToken: idToken,
            hashtag: hashtag,
            value: value
        })
    })
}

export {MyProfile, Profile}
