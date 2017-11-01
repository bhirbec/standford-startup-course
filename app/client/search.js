import algoliasearch from 'algoliasearch'
import {Router} from 'react-router-dom'
import {Link} from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'

import {UserAvatar} from './common'


class SearchBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {query: props.query}
    }

    componentDidMount() {
        ReactDOM.findDOMNode(this).focus()
    }

    componentWillReceiveProps(props) {
        this.state = {query: props.query}
    }

    onChange(e) {
        let query = e.target.value
        this.setState({query: query})

        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            let path = '/search?query=' + encodeURIComponent(query)
            Router.history.push(path, {query: query})
        }, 200)
    }

    render() {
        return <input
            type="text"
            className="form-control"
            placeholder="Search people & skills"
            value={this.state ? this.state.query: ''}
            onChange={this.onChange.bind(this)} />
    }
}


class SearchResult extends React.Component {

    componentWillReceiveProps(props) {
        this.search(props.query)
    }

    componentDidMount() {
        this.search(this.props.query)
    }

    search(query) {
        let config = window.config.algolia
        let client = algoliasearch(config.applicationId, config.searchOnlyApiKey);
        let index = client.initIndex('profile');

        // TODO: show pagination
        let params = {
            attributesToRetrieve: [
                'firstname',
                'lastname',
                'occupation',
                'location',
                'school',
                'companies',
                'hashtags',
                'photoURL',
                'uid',
            ],
            hitsPerPage: 50
        }

        index.search(query, params, (err, content) => {
            if (err) {
                console.error(err);
                return;
            }

            this.setState({profiles: content.hits})
        });
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }

        return <div className="search-result">
            {this.state.profiles.length == 0 && (
                <h2>No Result found</h2>
            )}
            {this.state.profiles.map((profile, i) => {
                return <div className="search-hit" key={`search-${profile.uid}`}>
                    <UserAvatar identity={{photoURL: profile.photoURL, firstname: profile.firstname}} />

                    <h2>
                        <Link to={`/in/${profile.uid}`}>
                            {profile.firstname} {profile.lastname}
                        </Link>
                    </h2>

                    <h3>{profile.occupation || "No known occupation..."}</h3>

                    {profile.companies && (
                        <div style={{margin: 0}}>
                            <span>Hired by: </span>
                            <span>{profile.companies.map(c =>
                                <div className="hashtag" key={`c-${profile.uid}-${c}`}>{c}</div>)
                            }</span>
                        </div>
                    )}

                    {profile.hashtags && (
                        <div style={{margin: 0}}>
                            <span>{profile.hashtags.map(h =>
                                <div className="hashtag" key={`h-${profile.uid}-${h}`}>#{h}</div>)
                            }</span>
                        </div>
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
            })}
        </div>
    }
}

export {SearchBox, SearchResult}
