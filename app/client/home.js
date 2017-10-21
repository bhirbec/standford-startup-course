import React from 'react'
import {Link} from 'react-router-dom'


class Home extends React.Component {
    render() {
        return <div className="content-section-a">
            <div className="intro-header">
                <div className="container intro-message">
                    <h1>
                        Let's show the world,<br />
                        <span className="main-color">How awesome you are</span>
                    </h1>

                    <Link to='/signup'>
                        <button
                            id="signup"
                            type="button"
                            className="btn btn-success">
                            Sign up
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
                                #SaveTime
                                <div className="main-color">Don't write your resume.</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Just fill in the basics. Your network will finish it for you!
                            </p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <i className="material-icons">lightbulb_outline</i>
                            <h4 className="card-title py-3 mbr-fonts-style display-5">
                                #ShowOff
                                <div className="main-color">Let's show you off.</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Receive positive reviews & up-votes on your skills
                                and abilities.
                            </p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <i className="material-icons">thumb_up</i>
                            <h4 className="card-title py-3 mbr-fonts-style display-5">
                                #GetHired
                                <div className="main-color">Well, that was easy.</div>
                            </h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Showcase a crowd-endorsed resume that gets
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
