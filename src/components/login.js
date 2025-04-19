import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! User: ", res.clientId);
        navigate('/pages/projects');
    }

    const onFailure = (err) => {
        console.log("LOGIN FAILURE! User: ", err);
    }

    return (
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} theme="filled_blue"/>
    )
}

export default Login;