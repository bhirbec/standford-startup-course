import {ContentState, convertFromRaw, Editor as DraftEditor, EditorState, RichUtils} from 'draft-js';
import React from 'react'
import ReactDOM from 'react-dom'

// https://draftjs.org/
// https://github.com/nikgraf/awesome-draft-js

class Editor extends React.Component {
    toggleBlockType(blockType) {
        this.props.onChange(
            RichUtils.toggleBlockType(
                this.props.editorState,
                blockType
            )
        )
    }

    toggleInlineStyle(inlineStyle) {
        this.props.onChange(
            RichUtils.toggleInlineStyle(
                this.props.editorState,
                inlineStyle
            )
        )
    }

    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.props.onChange(newState);
            return true;
        }
        return false;
    }

    render() {
        return <div className="RichEditor-root">
            <InlineStyleControls
                editorState={this.props.editorState}
                toggleInlineStyle={this.toggleInlineStyle.bind(this)}
                toggleBlockType={this.toggleBlockType.bind(this)}
            />

            <DraftEditor
                editorState={this.props.editorState}
                onChange={this.props.onChange}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                placeholder={'Write job description...'}
            />
        </div>
    }
}


class ReadOnlyEditor extends React.Component {
    render() {
        return <DraftEditor
            editorState={makeEditorState(this.props.content)}
            readOnly={true}
        />
    }
}

const BLOCK_TYPES = [
    // {label: 'H1', style: 'header-one'},
    // {label: 'H2', style: 'header-two'},
    // {label: 'H3', style: 'header-three'},
    // {label: 'H4', style: 'header-four'},
    // {label: 'H5', style: 'header-five'},
    // {label: 'H6', style: 'header-six'},
    // {label: 'Blockquote', style: 'blockquote'},
    {
        label: <i className="material-icons">format_list_bulleted</i>,
        style: 'unordered-list-item'
    },
    {
        label: <i className="material-icons">format_list_numbered</i>,
        style: 'ordered-list-item'
    },
    // {label: 'Code Block', style: 'code-block'},
];

var INLINE_STYLES = [
    {
        label: <i className="material-icons">format_bold</i>,
        style: 'BOLD'
    },
    {
        label: <i className="material-icons">format_italic</i>,
        style: 'ITALIC'
    },
    {
        label: <i className="material-icons">format_underline</i>,
        style: 'UNDERLINE'
    },
    // {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle()

    const {editorState} = props
    const selection = editorState.getSelection()
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType()

    return <div className="RichEditor-controls">
        {INLINE_STYLES.map(type =>
            <StyleButton
                key={type.style}
                active={currentStyle.has(type.style)}
                label={type.label}
                onToggle={props.toggleInlineStyle}
                style={type.style}
          />
        )}

        {BLOCK_TYPES.map((type) =>
            <StyleButton
                key={type.style}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.toggleBlockType}
                style={type.style}
            />
        )}
    </div>
}

class StyleButton extends React.Component {
    constructor(props) {
        super(props)
        this.onToggle = (e) => {
            e.preventDefault()
            this.props.onToggle(this.props.style)
        }
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return <span className={className} onMouseDown={this.onToggle}>
            {this.props.label}
        </span>
    }
}

function makeEditorState(rawEditorData) {
    let content
    if (typeof rawEditorData == 'string') {
        content = ContentState.createFromText(rawEditorData)
    } else {
        rawEditorData.entityMap = rawEditorData.entityMap || {}
        content = convertFromRaw(rawEditorData)
    }

    return EditorState.createWithContent(content)
}

export {Editor, ReadOnlyEditor, makeEditorState}
