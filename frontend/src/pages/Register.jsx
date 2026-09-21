import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/register.css'

const Register = () => {

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        phone_number: '',
    });

    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            
            const res = await axios.post('http://localhost:8080/api/auth/register', form, { withCredentials: true});
            navigate('/');
            
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="regis-title">Register</h1>
                {error && <h3>{error}</h3>}
                <form onSubmit={handleSubmit} className="register-form">
                    <p className="first-name">Your First Name</p>
                    <input required placeholder="First Name" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})}></input><br />
                    
                    <p className="last-name">Your Last Name</p>
                    <input required placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})}></input><br />
                    
                    <p className="email">Your Email</p>
                    <input required placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}></input><br />
                    
                    <p className="username">Your Username</p>
                    <input required placeholder="Username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}></input><br />
                    
                    <p className="password">Your Password</p>
                    <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}></input><br />
                    
                    <p className="phone">Your Phone Number</p>
                    <input required placeholder="Phone Number" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})}></input><br />

                    <button>Register</button>
                </form>
                <a href="http://localhost:5173/">Already have an account?</a>
            </div>
        </div>
    )
}

export default Register;