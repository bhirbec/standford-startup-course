import React from 'react';
import Select from 'react-select';

// react-select documentation
// https://jedwatson.github.io/react-select/

// Here's an example with Google contact API
// https://labs.magnet.me/nerds/2015/05/11/importing-google-contacts-with-javascript.html

let timeoutid = undefined


class MultiSelectField extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            options: [],
            value: [],
        }
    }

    handleSelectChange (value) {
        this.setState({ value });
    }

    getUsers (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        clearTimeout(timeoutid)

        timeoutid = setTimeout(function() {
            $.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&v=3.0&" +
                "&access_token=" + window.__config.accessToken +
                "&max-results=20" +
                "&q=" + input
            ).then(function (resp) {
                let entries = resp.feed.entry || []
                let options = []

                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i]
                    let emails = entry['gd$email'] ? entry['gd$email']: []

                    // TODO: use primary email?
                    if (emails.length > 0) {
                        let email = emails[0]
                        options.push({
                            label: email.address,
                            value: email.address
                        })
                    }
                }

                callback(null, {options: options})
            })
        }, 200);
    }

    render () {
        return (
            <div className="section">
                <Select.Async
                    multi={true}
                    value={this.state.value}
                    autoload={false}
                    filterOption={(opt, filter) => true}
                    loadOptions={this.getUsers.bind(this)}
                    placeholder={this.props.title}
                    options={this.state.options}
                    onChange={this.handleSelectChange.bind(this)} />
            </div>
        )
    }
}

module.exports = MultiSelectField
