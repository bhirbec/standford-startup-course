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
                    {identity.firstname ?
                        identity.firstname.charAt(0).toUpperCase()
                        :
                        <i className="material-icons" style={{fontSize: 30}}>person</i>
                    }
                </Avatar>
            )}
        </div>
    }
}

export {UserAvatar}
