import React from 'react'
import ReactDOM from 'react-dom'


export default class Form extends React.Component {

    componentDidMount() {
        this.populate(this.props.data || {})
        this.submitting = false

        /* this makes possible to fire the submit outside of the component. This is
        used in combination with onTouchTap event to fix textarea bug on android
        chrome */
        $(ReactDOM.findDOMNode(this)).submit(e => {
            e.stopImmediatePropagation()

            if (!this.submitting) {
                this.submitting = true
                this.onSubmit(e)
            } else {
                e.preventDefault()
            }
            return false;
        })
    }

    componentWillReceiveProps(nextProps) {
        // this assumes the parent component re-render itself after the submit.
        // Either showing error or redirecting
        this.submitting = false
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
        return <form className={this.props.className}>{this.props.children}</form>
    }
}
