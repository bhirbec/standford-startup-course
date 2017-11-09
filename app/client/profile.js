import React from 'react'
import ReactDOM from 'react-dom'
import {Link, Redirect, Route} from 'react-router-dom'
import Avatar from 'material-ui/Avatar'

import NoMatch from './error'
import {postHashtagLike, pending} from './model'
import ProfileForm from './profile-form'
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
                    <Link to={`/contact/${this.props.profileId}`}>
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


export {MyProfile, Profile}
