import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useUser } from "./UserContext";

function Login() {
    const { setUserId } = useUser();

    const navigate = useNavigate();

    const onSuccess = async (res) => {
        console.log("LOGIN SUCCESS! User: ", res.clientId);

        const user = jwtDecode(res.credential);
        localStorage.setItem('fullName', user.name);

        localStorage.setItem('token', res.credential); 
        //console.log("token:", res.credential);

        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                //user_name: user.name,  
                //user_email: user.email,  
                token: res.credential,
                projects: []
            }),
            headers: {
                'Content-Type': 'application/json' 
            }
        });
      

        // Optional: check response
        const json = await response.json();
        //console.log("Server response:", json);
        localStorage.setItem('Mongo_id', json._id);
        setUserId(json._id);
        navigate('src/pages/homepage');
        //console.log("Mongo ID:", json._id);    
    }

    const onFailure = (err) => {
        console.log("LOGIN FAILURE! User: ", err);
    }

    return (
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} theme="filled_blue"/>
    )
}

export default Login;
