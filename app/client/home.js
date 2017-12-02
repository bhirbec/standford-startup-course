import React from 'react'
import {Link} from 'react-router-dom'

import SocialButtons from './social'


class Home extends React.Component {
    onClickSignup() {
        gtag('event', 'onboarding-clicked-signup-on-home', {
            'event_category': 'onboarding',
            'event_label': `Clicked Signup button (Home page)`,
        })
    }

    render() {
        return <div className="home content-section-a">
            <div className="intro-header">
                <SocialButtons
                    shareUrl={`https://letsresume.com`}
                    title={`LetsResume - Résumés upvoted by the crowd`} />

                <div className="container intro-message">
                    <h1 className="home-h1">
                        <span className="main-color">LetsResume</span><br />
                        Make your résumé awesome.
                    </h1>
                    <Link to='/signup' onClick={this.onClickSignup.bind(this)}>
                        <button
                            id="signup"
                            type="button"
                            className="btn btn-success">
                            Sign up Free
                        </button>
                    </Link>
                </div>
            </div>

            <div className="features">
                <div className="container media-container-row">
                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <i className="material-icons">access_time</i>
                            <h4 className="card-title py-3 mbr-fonts-style display-5">
                                <div className="main-color">Don't write your résumé</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Just fill in the basics in under 3 minutes.<br />
                            </p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <i className="material-icons">share</i>
                            <h4 className="card-title py-3 mbr-fonts-style display-5">
                                <div className="main-color">Let the crowd raise you up</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Invite your trusted network to write positive
                                reviews & up-vote your skills.
                            </p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <i className="material-icons">thumb_up</i>
                            <h4 className="card-title py-3 mbr-fonts-style display-5">
                                <div className="main-color">Stand out from the pack</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Showcase a crowd-endorsed profile that gets
                                you noticed!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="video-container" className="container media-container-row">
                <h2>Watch the 1-minute how it works video</h2>
                <iframe id="video"
                    src="https://www.youtube.com/embed/C5lhLSscV1A?rel=0&amp;controls=0&amp;showinfo=0"
                    frameBorder="0"
                    allowFullScreen="true"></iframe>
            </div>

            <div className="about-us">
                <div className="container">
                    <h2 className="main-color">Why LetsResume?</h2>
                    <p>
                        Did you know that <strong> job seekers spend </strong> on average&nbsp;
                        <strong>3 weeks writing their résumé</strong>? While &nbsp;
                        <strong>Recruiters spend just <u>6</u> seconds reviewing it</strong>.
                        We asked ourselves why is everyone wasting their lives doing this exercise?
                    </p>
                    <div>
                        <p>Recruiters care about 3 key elements with a potential hire:</p>
                        <ul>
                            <li>right skills</li>
                            <li>cultural fit</li>
                            <li>potential to grow</li>
                        </ul>
                    </div>
                    <p>
                        The résumé is a biased version of yourself written by you. So
                        how do Recruiters know you are who you say you are? We created
                        a platform to help you change this. By asking your network
                        to contribute to your profile you build a powerful, accurate,
                        and crowd-supported identity that makes you look awesome. It's
                        free to join!
                    </p>
                    <Link to='/signup' onClick={this.onClickSignup.bind(this)}>
                        <button
                            id="signup"
                            type="button"
                            className="btn btn-success">
                            Sign up Free
                        </button>
                    </Link>
                </div>
            </div>

            <div className="footer">
                <div className="container">
                    <div className="media-container-column mbr-white col-md-8">
                        &copy; Copyright 2017 LetsResume - All Rights Reserved
                    </div>
                </div>
            </div>
        </div>
    }
}

module.exports = Home
