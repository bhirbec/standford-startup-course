import React from 'react'
import ReactDOM from 'react-dom'


// TODO: set focus on first element
class BaseForm extends React.Component {

    setValue(input) {
        let data = this.props.data || this.state || {}
        if (input) {
            $(input).val(data[input.name] || '')
        }
    }

    formData() {
        let $form = $(ReactDOM.findDOMNode(this))
        if (!$form.is('form')) {
            $form = $form.find('form')
        }

        let data = {};
        $.each($form.serializeArray(), function(_, kv) {
            data[kv.name] = kv.value;
        });

        return data
    }
}

function SetValue(input) {
    let data = this.props.data || {}
    if (input) {
        $(input).val(data[input.name] || '')
    }
}

function FormData(form) {
    let data = {};
    $.each($(form).serializeArray(), function(_, kv) {
        data[kv.name] = kv.value;
    });

    return data
}

export {BaseForm, SetValue, FormData}
