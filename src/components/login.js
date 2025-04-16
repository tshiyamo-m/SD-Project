import { GoogleLogin } from '@react-oauth/google';

function Login() {

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! User: ", res.clientId);
    }

    const onFailure = (err) => {
        console.log("LOGIN FAILURE! User: ", err);
    }

    return (
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} theme="filled_blue"/>
    )
}

export default Login;