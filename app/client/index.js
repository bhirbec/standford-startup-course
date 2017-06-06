import React from 'react';
import ReactDOM from 'react-dom';


class App extends React.Component {
    render() {
        return <p>
            Thanks for signing up at LetsResume. We are currently finalizing the service while being
            incubated at Stanford University, and will be launching really soon! We will let you
            know when we launch.
        </p>
    }
};

ReactDOM.render(<App />, document.getElementById('app'));
