import Avatar from 'material-ui/Avatar'
import React from 'react'
import ReactDOM from 'react-dom'


class UserAvatar extends React.Component {
    render() {
        let identity = this.props.identity
        let size = this.props.size || 50

        return <div className="avatar">
            {identity.photoURL && (
                <Avatar src={identity.photoURL} size={size} />
            )}
            {!identity.photoURL && (
                <Avatar size={size}>
                    {identity.firstname.charAt(0).toUpperCase()}
                </Avatar>
            )}
        </div>
    }
}

export {UserAvatar}
