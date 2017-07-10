import React from 'react'
import ReactDOM from 'react-dom'


class BaseForm extends React.Component {

    setValue(input) {
        let data = this.props.data || {}
        if (input) {
            $(input).val(data[input.name] || '')
        }
    }

    formData() {
        let $form = $(ReactDOM.findDOMNode(this)).find('form')

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        return data
    }
}

export {BaseForm}
