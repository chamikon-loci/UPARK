import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../styles/login.css'

const Login = ({setUser}) => {

    const [form, setForm] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', form, { withCredentials: true });
            setUser(res.data.user);
            console.log('ผู้ใช้ปัจจุบัน: ', res.data.user.username);
            if(res.data.user.role_name === 'Admin')
                navigate('/Admin')
            else if(res.data.user.role_name === 'Staff')
                navigate('/Staff');
            else 
                navigate('/home');
        } catch (error) {
            setError('Username หรือ Password ผิด');
        }
    }

    return (
        <div className="login-container">
            <h2>PARKING</h2>
            <h1>Good to see you!</h1>
            <div className="login-box">
                {error && <h3 className="error">{error}</h3> }
                <form onSubmit={handleSubmit} className="login-form">
                    <p className="title-username">Your Username</p>
                    <input placeholder="e.g. Homelander666 " value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value})}></input><br />
                    <p className="title-password">Your Password</p>
                    <input type="password" placeholder="e.g. Mypass2#" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value})}></input><br />
                    <button>Login</button>
                </form>
                <a href="http://localhost:5173/register" className="no-account">Don't have an account?</a>
            </div>
        </div>
    )
}

export default Login;