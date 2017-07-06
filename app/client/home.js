import React from 'react'


class Home extends React.Component {
    componentDidMount() {
        gapi.signin2.render('google-signin', {
            scope: 'profile email',
            theme: 'dark',
            width: 120
        })
    }

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
                                <div id="google-signin"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

module.exports = Home
