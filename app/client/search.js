import algoliasearch from 'algoliasearch'
import {Router} from 'react-router-dom'
import {Link} from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'


class SearchBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {query: props.query}
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
            placeholder="Search people"
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
          attributesToRetrieve: ['firstname', 'lastname', 'uid'],
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

        return <div>
            {this.state.profiles.length == 0 && (
                <h2>No Result found</h2>
            )}
            {this.state.profiles.map((profile, i) => {
                return <div key={`search-${profile.uid}`}>
                    <h2>{profile.firstname} {profile.lastname}</h2>
                    <Link to={`/in/${profile.uid}`}>View profile</Link>
                </div>
            })}
        </div>
    }
}

export {SearchBox, SearchResult}
