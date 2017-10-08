import React from 'react'
import ReactDOM from 'react-dom'


export default class Form extends React.Component {

    componentDidMount() {
        this.populate(this.props.data || {})
    }

    componentWillReceiveProps(nextProps) {
        this.populate(nextProps.data || {})
    }

    populate(data) {
        // TODO: handle radio button and checkbox
        let $form = $(ReactDOM.findDOMNode(this))
        for (let n in data) {
            $form.find('[name=' + n + ']').val(data[n])
        }

        $form.find(':input').first().focus()
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
        return <form
            onSubmit={this.onSubmit.bind(this)}
            className={this.props.className}>
            {this.props.children}
        </form>
    }
}
