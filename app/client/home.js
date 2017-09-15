import React from 'react'
import {Link} from 'react-router-dom'


class Home extends React.Component {
    render() {
        return <div className="content-section-a">
            <div className="intro-header">
                <div className="container intro-message">
                    <h1>
                        Your résumé, <span className="main-color">built by the crowd.</span>
                    </h1>
                    <h2>
                        Create an authentic resume with the world's first<br />
                        crowd-sourced résumé building platform.
                    </h2>

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
                            <h4 className="card-title py-3 mbr-fonts-style display-5 main-color">Never write your résumé again!</h4>
                            <p className="mbr-text mbr-fonts-style display-7">In just minutes, get up and running with a powerful résumé, that highlights your work experiences and unique skills.&nbsp;</p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <h4 className="card-title py-3 mbr-fonts-style display-5 main-color">Receive reviews &amp; endorsements from your trusted network&nbsp;</h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Invite colleagues, employers, advisors, professors &amp; clients to write supportive reviews of your projects, skills &amp; capabilities.</p>
                        </div>
                    </div>

                    <div className="card p-3 col-12 col-md-6 col-lg-4">
                        <div className="card-box">
                            <h4 className="card-title py-3 mbr-fonts-style display-5 main-color">Showcase a résumé that stands out from the crowd!</h4>
                            <p className="mbr-text mbr-fonts-style display-7">
                                Radically transform your old résumé into a dynamic, authentic, online showcase that catapults you to new career heights.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="about-us">
                <div className="container">
                    <div className="media-container-column mbr-white col-md-8">
                        <h3 className="main-color">
                            About Us
                        </h3>
                        <p className="mbr-text align-left pb-3 mbr-fonts-style display-5">
                            Did you know that the <strong>average job seeker spends 1 to</strong>
                            <strong>3 weeks writing their résumé</strong>? While the average&nbsp;
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
                            <strong>to write your résumé with you.</strong>
                        </p>
                        <p>
                            <strong>LetsResume is <u>free</u> to join</strong>, and is currently
                            being incubated at Stanford University.
                        </p>
                    </div>
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
