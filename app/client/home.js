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
        return <div className="content-section-a">
            <div className="intro-header">
                <SocialButtons
                    shareUrl={`https://letsresume.com`}
                    title={`LetsResume - Résumés upvoted by the crowd`} />

                <div className="container intro-message">
                    <h1 className="home-h1">
                        <span className="main-color">LetsResume</span><br />Résumés upvoted by the crowd.
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
                                <div className="main-color">Don't write your resume</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Just fill in the basics in under 3 minutes.<br />
                                (Recruiters won't read the rest anyways)
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



            {/*<div className="about-us">
                <div className="container">
                    <div className="media-container-column mbr-white col-md-8">
                        <h3 className="main-color">
                            About Us
                        </h3>
                        <p className="mbr-text align-left pb-3 mbr-fonts-style display-5">
                            Did you know that the <strong>average job seeker spends 1 to </strong>
                            <strong>3 weeks writing their resume</strong>? While the average&nbsp;
                            <strong>Recruiter spends just <u>6</u> seconds reviewing it</strong>.
                        </p>
                        <p>
                            Imagine if you could radically transform that old, stale document [your resume],
                            into a <strong>more powerful, authentic, and dynamic showcase</strong> that rapidly
                            catapults your career to the next level.
                        </p>
                        <p>
                            Using design thinking, we've re-imagined the entire experience from the bottom-up,
                            to help millions of folks just like you around the world,&nbsp;
                            <strong>use the power of their network (and the crowd)</strong>,&nbsp;
                            <strong>to write your resume with you.</strong>
                        </p>
                        <p>
                            <strong>LetsResume is <u>free</u> to join</strong>, and is currently
                            being incubated at Stanford University.
                        </p>
                    </div>
                </div>
            </div>*/}

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
