import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


function Login() {

    const navigate = useNavigate();

    

    const onSuccess = async (res) => {
        console.log("LOGIN SUCCESS! User: ", res.clientId);
        navigate('src/pages/homepage');

        const user = jwtDecode(res.credential);

        localStorage.setItem('fullName', user.name);
        

        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                token: res.credential,
                projects: []
            }),
            headers: {
                'Content-Type': 'application/json' 
            }
        });
      

        // Optional: check response
        const json = await response.json();
        
        localStorage.setItem('Mongo_id', json._id);

    }

    const onFailure = (err) => {
        console.log("LOGIN FAILURE! User: ", err);
    }

    return (
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} theme="filled_blue"/>
    )
}

export default Login;
