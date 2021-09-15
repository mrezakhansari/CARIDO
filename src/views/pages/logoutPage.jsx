import { Component } from 'react';
import auth from '../../services/authService';

class LogoutPage extends Component {

    componentDidMount() {
        auth.logout();
        window.location = "/";
    }

    render() {
        return null;
    }
}

export default LogoutPage;