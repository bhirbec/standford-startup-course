import React from 'react'
import ReactDOM from 'react-dom'


export default class Form extends React.Component {

    componentWillReceiveProps(nextProps) {
        this.populate(nextProps.data || {})
    }

    componentDidMount() {
        this.populate(this.props.data || {})
    }

    populate(data) {
        // TODO: set focus on first element
        // TODO: handle radio button and checkbox
        let $form = $(ReactDOM.findDOMNode(this))
        for (let n in data) {
            $form.find('[name=' + n + ']').val(data[n])
        }
    }

    onSubmit(e) {
        e.preventDefault()

        let data = {};
        let $form = $(ReactDOM.findDOMNode(this))

        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        this.props.onSubmit(data)
    }

    render() {
        return <form onSubmit={this.onSubmit.bind(this)}>
            {this.props.children}
        </form>
    }
}

