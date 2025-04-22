import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Login() {

    const navigate = useNavigate();

    const onSuccess = async (res) => {
        console.log("LOGIN SUCCESS! User: ", res.clientId);
        navigate('src/pages/projects');

        //const user = jwtDecode(res.credential);
        //console.log("Decoded User Info:", user);
        //console.log(res.credential)

        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                //user_name: user.name,  
                //user_email: user.email,  
                token: res.credential
            }),
            headers: {
                'Content-Type': 'application/json' 
            }
        });
      

        // Optional: check response
        const json = await response.json();
        console.log("Server response:", json);
               
    }

    const onFailure = (err) => {
        console.log("LOGIN FAILURE! User: ", err);
    }

    return (
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} theme="filled_blue"/>
    )
}

export default Login;