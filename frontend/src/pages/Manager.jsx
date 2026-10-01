import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/manager.css";

const Manager = ({ user }) => {
    const [parkingLots, setParkingLots] = useState([]);
    const [prices, setPrices] = useState({});
    const [staff, setStaff] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [selectedParkingLot, setSelectedParkingLot] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [report, setReport] = useState(null);
    const [reportParkingLot, setReportParkingLot] = useState(null);
    const [usageAnalysis, setUsageAnalysis] = useState(null);
    const [usageParkingLot, setUsageParkingLot] = useState(null);
    const [satisfactionAnalysis, setSatisfactionAnalysis] = useState(null);
    const [satisfactionParkingLot, setSatisfactionParkingLot] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [dashboardParkingLot, setDashboardParkingLot] = useState(null);

    const getParkingLots = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getParkingLots?user_id=${user.user_id}`, { withCredentials: true });
            setParkingLots(res.data.data);
        } catch (error) {
            alert(error.response?.data?.message || "ไม่สามารถดึงข้อมูลลานจอดได้");
        }
    };

    const getStaff = async parkingLot_id => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getStaff?user_id=${user.user_id}&parkingLot_id=${parkingLot_id}`, { withCredentials: true });
            setStaff(res.data.data);
            setAvailableStaff(res.data.availableStaff);
            setSelectedParkingLot(parkingLot_id);
        } catch (error) {
            alert("ไม่สามารถดึงข้อมูล Staff ได้");
        }
    };

    const addStaff = async () => {
        if (!selectedStaff) {
            alert("กรุณาเลือก Staff");
            return;
        }

        try {
            const res = await axios.post("http://localhost:8080/api/manager/addStaff", {
                manager_id: user.user_id,
                user_id: Number(selectedStaff),
                parkingLot_id: selectedParkingLot
            }, { withCredentials: true });

            alert(res.data.message);
            setSelectedStaff("");
            getStaff(selectedParkingLot);
        } catch (error) {
            alert(error.response?.data?.message || "เพิ่ม Staff ไม่สำเร็จ");
        }
    };

    const removeStaff = async (staffUserId, parkingLot_id) => {
        try {
            const res = await axios.delete("http://localhost:8080/api/manager/removeStaff", {
                data: {
                    manager_id: user.user_id,
                    user_id: staffUserId,
                    parkingLot_id
                },
                withCredentials: true
            });

            alert(res.data.message);
            getStaff(parkingLot_id);
        } catch (error) {
            alert(error.response?.data?.message || "ลบ Staff ไม่สำเร็จ");
        }
    };

    const getReport = async parkingLot_id => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getReport?user_id=${user.user_id}&parkingLot_id=${parkingLot_id}`, { withCredentials: true });
            setReport(res.data.data);
            setReportParkingLot(parkingLot_id);
        } catch (error) {
            alert("ไม่สามารถดึง Report ได้");
        }
    };

    const getUsageAnalysis = async parkingLot_id => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getUsageAnalysis?user_id=${user.user_id}&parkingLot_id=${parkingLot_id}`, { withCredentials: true });
            setUsageAnalysis(res.data.data);
            setUsageParkingLot(parkingLot_id);
        } catch (error) {
            alert("ไม่สามารถวิเคราะห์การใช้งานได้");
        }
    };

    const getSatisfactionAnalysis = async parkingLot_id => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getSatisfactionAnalysis?user_id=${user.user_id}&parkingLot_id=${parkingLot_id}`, { withCredentials: true });
            setSatisfactionAnalysis(res.data.data);
            setSatisfactionParkingLot(parkingLot_id);
        } catch (error) {
            alert("ไม่สามารถวิเคราะห์ความพึงพอใจได้");
        }
    };

    const getRealTimeDashboard = async parkingLot_id => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manager/getRealTimeDashboard?user_id=${user.user_id}&parkingLot_id=${parkingLot_id}`, { withCredentials: true });
            setDashboard(res.data.data);
            setDashboardParkingLot(parkingLot_id);
        } catch (error) {
            alert("ไม่สามารถดึง Real-time Dashboard ได้");
        }
    };

    const changePrice = async parkingLot_id => {
        const price = prices[parkingLot_id];

        if (!price || Number(price) <= 0) {
            alert("กรุณากรอกราคาที่มากกว่า 0");
            return;
        }

        try {
            const res = await axios.put("http://localhost:8080/api/manager/changePricingPolicy", {
                parkingLot_id,
                user_id: user.user_id,
                price_per_hour: Number(price)
            }, { withCredentials: true });

            alert(res.data.message);
            setPrices({ ...prices, [parkingLot_id]: "" });
            getParkingLots();
        } catch (error) {
            alert(error.response?.data?.message || "เปลี่ยนราคาไม่สำเร็จ");
        }
    };

    const changeStatus = async (parkingLot_id, status) => {
        try {
            const res = await axios.put("http://localhost:8080/api/manager/changeParkingLotStatus", {
                parkingLot_id,
                user_id: user.user_id,
                status
            }, { withCredentials: true });

            alert(res.data.message);
            getParkingLots();
        } catch (error) {
            alert(error.response?.data?.message || "เปลี่ยนสถานะลานจอดไม่สำเร็จ");
        }
    };

    useEffect(() => {
        if (user) getParkingLots();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const socket = io("http://localhost:8080", { withCredentials: true });

        socket.on("parkingUpdate", () => {
            if (dashboardParkingLot) getRealTimeDashboard(dashboardParkingLot);
        });

        return () => {
            socket.off("parkingUpdate");
            socket.disconnect();
        };
    }, [user, dashboardParkingLot]);

    if (!user) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="manager-container">
            <h1>MANAGER</h1>
            <h2>ลานจอดที่รับผิดชอบ</h2>

            {parkingLots.length === 0 ? (
                <p>ยังไม่มีลานจอดที่รับผิดชอบ</p>
            ) : (
                <div className="manager-lot-list">
                    {parkingLots.map(lot => (
                        <div className="manager-lot-card" key={lot.parkinglot_id}>
                            <h3>{lot.parkinglot_name}</h3>
                            <p>ราคา: {lot.price_per_hour} บาท/ชั่วโมง</p>

                            <div className="manager-section">
                                <h3>เปลี่ยนราคา</h3>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="ราคาใหม่ต่อชั่วโมง"
                                    value={prices[lot.parkinglot_id] || ""}
                                    onChange={e => setPrices({
                                        ...prices,
                                        [lot.parkinglot_id]: e.target.value
                                    })}
                                />
                                <button onClick={() => changePrice(lot.parkinglot_id)}>
                                    เปลี่ยนราคา
                                </button>
                            </div>

                            <div className="manager-section">
                                <h3>สถานะลานจอด</h3>
                                <p>สถานะ: {lot.status}</p>

                                {lot.status === "Open" && (
                                    <button onClick={() => changeStatus(lot.parkinglot_id, "Closed")}>
                                        ปิดลานจอด
                                    </button>
                                )}

                                {lot.status === "Closed" && (
                                    <button onClick={() => changeStatus(lot.parkinglot_id, "Open")}>
                                        เปิดลานจอด
                                    </button>
                                )}
                            </div>

                            <div className="manager-section">
                                <h3>จัดการ Staff</h3>
                                <button onClick={() => getStaff(lot.parkinglot_id)}>ดู Staff</button>

                                {selectedParkingLot === lot.parkinglot_id && (
                                    <div>
                                        <h4>Staff ของ {lot.parkinglot_name}</h4>

                                        {staff.length === 0 ? (
                                            <p>ยังไม่มี Staff</p>
                                        ) : (
                                            staff.map(item => (
                                                <div key={item.parkinglotstaff_id}>
                                                    <p>User ID: {item.user_id}</p>
                                                    <p>Username: {item.username}</p>
                                                    <p>Email: {item.email}</p>
                                                    <button onClick={() => removeStaff(item.user_id, lot.parkinglot_id)}>
                                                        ลบ Staff
                                                    </button>
                                                </div>
                                            ))
                                        )}

                                        <h4>เพิ่ม Staff</h4>

                                        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                                            <option value="">เลือก Staff</option>
                                            {availableStaff.map(item => (
                                                <option key={item.user_id} value={item.user_id}>
                                                    {item.username} - {item.email}
                                                </option>
                                            ))}
                                        </select>

                                        <button onClick={addStaff}>เพิ่ม Staff</button>
                                    </div>
                                )}
                            </div>

                            <div className="manager-section">
                                <h3>Report</h3>
                                <button onClick={() => getReport(lot.parkinglot_id)}>ดู Report</button>

                                {reportParkingLot === lot.parkinglot_id && report && (
                                    <div>
                                        <h4>Report ของ {lot.parkinglot_name}</h4>
                                        <p>จำนวนการจองทั้งหมด: {report.total_reservations}</p>
                                        <p>การจองที่เสร็จสิ้น: {report.completed_reservations}</p>
                                        <p>รถที่กำลังจอด: {report.current_parking}</p>
                                        <p>Queue ที่กำลังรอ: {report.waiting_queue}</p>
                                        <p>รายได้: {report.revenue} บาท</p>
                                        <p>จำนวน Rating: {report.total_ratings}</p>
                                        <p>คะแนน Rating เฉลี่ย: {Number(report.average_rating).toFixed(2)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="manager-section">
                                <h3>Usage Analysis</h3>
                                <button onClick={() => getUsageAnalysis(lot.parkinglot_id)}>
                                    วิเคราะห์การใช้งาน
                                </button>

                                {usageParkingLot === lot.parkinglot_id && usageAnalysis && (
                                    <div>
                                        <h4>วิเคราะห์การใช้งานของ {lot.parkinglot_name}</h4>
                                        <p>จำนวนการใช้งานทั้งหมด: {usageAnalysis.total_usage}</p>
                                        <p>จำนวน Check-in: {usageAnalysis.total_check_in}</p>

                                        <p>
                                            ช่องจอดที่ถูกใช้งานมากที่สุด:{" "}
                                            {usageAnalysis.popular_slot
                                                ? usageAnalysis.popular_slot.parkingSlot_name
                                                : "ยังไม่มีข้อมูล"}
                                        </p>

                                        {usageAnalysis.popular_slot && (
                                            <p>จำนวนครั้ง: {usageAnalysis.popular_slot.usage_count}</p>
                                        )}

                                        <p>
                                            ช่วงเวลาที่มีการใช้งานมากที่สุด:{" "}
                                            {usageAnalysis.popular_hour
                                                ? `${usageAnalysis.popular_hour.hour}:00 น.`
                                                : "ยังไม่มีข้อมูล"}
                                        </p>

                                        {usageAnalysis.popular_hour && (
                                            <p>จำนวนการใช้งาน: {usageAnalysis.popular_hour.usage_count} ครั้ง</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="manager-section">
                                <h3>Satisfaction Analysis</h3>
                                <button onClick={() => getSatisfactionAnalysis(lot.parkinglot_id)}>
                                    วิเคราะห์ความพึงพอใจ
                                </button>

                                {satisfactionParkingLot === lot.parkinglot_id && satisfactionAnalysis && (
                                    <div>
                                        <h4>วิเคราะห์ความพึงพอใจของ {lot.parkinglot_name}</h4>
                                        <p>จำนวน Rating ทั้งหมด: {satisfactionAnalysis.total_ratings}</p>
                                        <p>คะแนนเฉลี่ย: {Number(satisfactionAnalysis.average_rating).toFixed(2)} / 5</p>
                                        <p>5 ดาว: {satisfactionAnalysis.five_star} ครั้ง</p>
                                        <p>4 ดาว: {satisfactionAnalysis.four_star} ครั้ง</p>
                                        <p>3 ดาว: {satisfactionAnalysis.three_star} ครั้ง</p>
                                        <p>2 ดาว: {satisfactionAnalysis.two_star} ครั้ง</p>
                                        <p>1 ดาว: {satisfactionAnalysis.one_star} ครั้ง</p>
                                    </div>
                                )}
                            </div>

                            <div className="manager-section">
                                <h3>Real-time Dashboard</h3>
                                <button onClick={() => getRealTimeDashboard(lot.parkinglot_id)}>
                                    ดู Real-time Dashboard
                                </button>

                                {dashboardParkingLot === lot.parkinglot_id && dashboard && (
                                    <div>
                                        <h4>สถานะปัจจุบันของ {lot.parkinglot_name}</h4>
                                        <p>จำนวนช่องจอดทั้งหมด: {dashboard.total_slots}</p>
                                        <p>ช่องว่าง: {dashboard.available_slots}</p>
                                        <p>ช่องที่ถูกจอง: {dashboard.reserved_slots}</p>
                                        <p>ช่องที่กำลังใช้งาน: {dashboard.occupied_slots}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Manager;