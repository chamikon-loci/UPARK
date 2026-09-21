import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/admin.css'

const Admin = ({ user }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/admin/getUsers", { withCredentials: true });
                setUsers(res.data.data);
            } catch (error) {
                console.error("Error", error);
            }
        };
        getUsers();
    }, []);

    const changeRole = async (user_id, role) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/changeRole/${user_id}`, { role }, { withCredentials: true });
            setUsers(users.map(user => user.user_id === user_id ? { ...user, role_name: role } : user));
        } catch (error) {
            console.error("Error", error);
        }
    };

    return (
        <div className="admin-container">
            <h2 className="admin-title">PARKING</h2>

            <div className="admin-box">
                <h1>Admin Dashboard</h1>
                <p className="admin-description">จัดการสิทธิ์การใช้งานของผู้ใช้</p>

                <div className="user-list">
                    {users.map(user => (
                        <div className="user-card" key={user.user_id}>
                            <div className="user-info">
                                <p className="username">{user.username}</p>
                                <p className="current-role">Current Role : <span>{user.role_name}</span></p>
                            </div>

                            <select value={user.role_name} onChange={(e) => changeRole(user.user_id, e.target.value)}>
                                <option value="Customer">Customer</option>
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;