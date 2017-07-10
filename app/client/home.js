import React from 'react'
import {Link} from 'react-router-dom'


class Home extends React.Component {
    render() {
        return <div className="intro-header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="intro-message">
                            <h1>
                                Your resume, <span className="salmon">built by the crowd.</span>
                            </h1>
                            <h2 style={{marginTop: '50px'}}>
                                Never write a résumé again!<br />
                                Your network will do it for you.
                            </h2>

                            <div style={{marginTop: '50px'}}>
                                <h1>Sign up <span className="salmon">now</span>!</h1>
                                <Link to='/signup'>Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

module.exports = Home
