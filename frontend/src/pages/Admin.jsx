import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/admin.css";

const Admin = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [managers, setManagers] = useState([]);
    const [parkingLots, setParkingLots] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedParkingLot, setSelectedParkingLot] = useState("");

    const getUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/admin/getUsers", { withCredentials: true });
            setUsers(res.data.data);
        } catch (error) {
            console.error("Error");
        }
    };

    const getUserActivities = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/admin/getUserActivities", { withCredentials: true });
            setActivities(res.data.data);
        } catch (error) {
            console.error("Error");
        }
    };

    const getManagerData = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/admin/getManagersAndParkingLots", { withCredentials: true });
            setManagers(res.data.managers);
            setParkingLots(res.data.parkingLots);
            setAssignments(res.data.assignments);
        } catch (error) {
            console.error("Error");
        }
    };

    useEffect(() => {
        getUsers();
        getUserActivities();
        getManagerData();
    }, []);

    const changeRole = async (user_id, role) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/changeRole/${user_id}`, { role }, { withCredentials: true });
            setUsers(users.map(u =>u.user_id === user_id ? { ...u, role_name: role } : u));
            getManagerData();
        } catch (error) {
            alert("ไม่สามารถเปลี่ยน Role ได้");
        }
    };

    const assignManager = async () => {
        if (!selectedManager || !selectedParkingLot) {
            alert("กรุณาเลือก Manager และลานจอด");
            return;
        }

        try {
            await axios.put("http://localhost:8080/api/admin/assignManager",{ user_id: selectedManager,parkingLot_id: selectedParkingLot }, { withCredentials: true });
            alert("มอบหมายลานจอดสำเร็จ");
            setSelectedManager("");
            setSelectedParkingLot("");
            getManagerData();
        } catch (error) {
            alert("ไม่สามารถมอบหมายลานจอดได้");
        }
    };

    const formatDate = date => date ? new Date(date).toLocaleString("th-TH") : "-";

    return (
        <div className="admin-container">
            <h2 className="admin-title">PARKING</h2>

            <div className="admin-box">
                <h1>Admin Dashboard</h1>
                <p className="admin-description">จัดการสิทธิ์การใช้งานของผู้ใช้</p>

                <div className="user-list">
                    {users.map(u => (
                        <div className="user-card" key={u.user_id}>
                            <div className="user-info">
                                <p className="username">{u.username}</p>
                                <p className="current-role">
                                    Current Role : <span>{u.role_name}</span>
                                </p>
                            </div>

                            <select
                                value={u.role_name}
                                onChange={e => changeRole(u.user_id, e.target.value)}
                            >
                                <option value="Customer">Customer</option>
                                <option value="Staff">Staff</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="admin-box">
                <h1>Manager Parking Lot</h1>
                <p className="admin-description">กำหนดลานจอดที่ Manager รับผิดชอบ</p>

                <div>
                    <select value={selectedManager} onChange={e => setSelectedManager(e.target.value)}>
                        <option value="">เลือก Manager</option>
                        {managers.map(m => (
                            <option key={m.user_id} value={m.user_id}>{m.username}</option>
                        ))}
                    </select>

                    <select value={selectedParkingLot} onChange={e => setSelectedParkingLot(e.target.value)}>
                        <option value="">เลือกลานจอด</option>
                        {parkingLots.map(p => (
                            <option key={p.parkingLot_id} value={p.parkingLot_id}>
                                {p.parkingLot_name}
                            </option>
                        ))}
                    </select>

                    <button onClick={assignManager}>มอบหมายลานจอด</button>
                </div>

                <div className="user-list">
                    {assignments.map(a => (
                        <div className="user-card" key={a.parkingLotManager_id}>
                            <div className="user-info">
                                <p className="username">{a.username}</p>
                                <p>ลานจอด : <span>{a.parkingLot_name}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="admin-box">
                <h1>User Activity History</h1>
                <p className="admin-description">ประวัติการใช้งานของผู้ใช้ทั้งหมด</p>

                {!activities.length ? (
                    <p>ยังไม่มีประวัติการใช้งาน</p>
                ) : (
                    <div>
                        {activities.map(a => (
                            <div
                                className="user-card"
                                key={a.activity_type + a.reference_id + a.activity_time}
                            >
                                <div className="user-info">
                                    <p className="username">{a.username}</p>
                                    <p>Activity : <span>{a.activity_type}</span></p>
                                    <p>{a.description}</p>
                                    <p>เวลา : {formatDate(a.activity_time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;