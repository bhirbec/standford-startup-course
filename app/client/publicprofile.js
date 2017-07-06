import React from 'react'
import ReactDOM from 'react-dom'


class PublicProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.serverData
    }

    componentDidMount() {
        let profileRef = firebase.database().ref('profile').child(this.props.profileId)
        profileRef.on('value', (snap) => {
            this.setState(snap.val())
        })
    }

    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }

        let refIds = Object.keys(this.state.experience || [])
        let profileName = this.state['google-profile'].name

        return <div className="me">
            <h1>{profileName}</h1>

            {refIds.map((expId) => {
                let reviews = []
                if (this.state.review) {
                    for (let revId in this.state.review[expId] || {}) {
                        reviews.push(this.state.review[expId][revId])
                    }
                }

                return <Experience
                    key={"exp-" + expId}
                    user={this.props.user}
                    profileName={profileName}
                    profileId={this.props.profileId}
                    expId={expId}
                    exp={this.state.experience[expId]}
                    reviews={reviews} />
            })}
        </div>
    }
}


class Experience extends React.Component {
    render() {
        return <div className="job-experience">
            <h3>{this.props.exp.companyName} - {this.props.exp.jobTitle}</h3>

            {(this.props.exp.jobStartDate || this.props.exp.jobEndDate) && (
                <div className="job-dates">
                    {this.props.exp.jobStartDate} to {this.props.exp.jobEndDate || 'present'}
                </div>
            )}

            <p className="job-description">
                {this.props.exp.jobDescription}
            </p>

            {this.props.reviews.map((rev, i) => {
                return <div key={'review-' + this.props.expId + '-' + i} className="review">
                    <div className="review-text">
                        &ldquo;{rev.review}&rdquo;
                    </div>
                    <div className="review-info">Someone - {rev.UTCdate}</div>
                </div>
            })}

            {this.props.user && (
                <NewReview
                    user={this.props.user}
                    profileId={this.props.profileId}
                    profileName={this.props.profileName}
                    expId={this.props.expId}
                    jobTitle={this.props.exp.jobTitle} />
            )}
        </div>
    }
}

class NewReview extends React.Component {
    onClick() {
        $(ReactDOM.findDOMNode(this)).find('.modal').modal('show')
        this.forceUpdate()
    }

    save(formData) {
        let refStr = `profile/${this.props.profileId}/review/${this.props.expId}`
        let ref = firebase.database().ref(refStr)
        let $node = $(ReactDOM.findDOMNode(this))

        let data = {
            review: formData.review,
            fromUserId: this.props.user.uid,
            UTCdate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
        }

        ref.push().set(data, function() {
            $node.find('.modal').modal('hide')
        })
    }

    render() {
        return <div>
            <button type="button"
                className="btn btn-default"
                onClick={this.onClick.bind(this)}>
                Add a Review
            </button>
            <Modal title={`Review ${this.props.profileName} for position "${this.props.jobTitle}"`}
                save={this.save.bind(this)}
                data={{}} />
        </div>
    }
}

// TODO: set focus on first element
class Modal extends React.Component {

    setValue(input) {
        if (input) {
            $(input).val(this.props.data[input.name] || '')
        }
    }

    handleForm(e) {
        let $form = $(ReactDOM.findDOMNode(this)).find('form')

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        this.props.save(data)
        e.preventDefault()
    }

    render() {
        return <div className="modal fade" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">
                            &times;
                        </button>
                        <h4 className="modal-title">{this.props.title}</h4>
                    </div>
                    <form onSubmit={this.handleForm.bind(this)}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="review">Enter your review</label>
                                <textarea id="review"
                                    name="review"
                                    rows={'4'}
                                    ref={this.setValue.bind(this)}
                                    className="form-control"></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Save</button>
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

export {PublicProfile}
