import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import '../styles/slots.css';

const ParkingSlot = ({ user, car }) => {
    const location = useLocation();
    const parkingLot_id = location.state?.parkingLot_id;

    const [slots, setSlots] = useState(location.state?.slots || []);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [myQueue, setMyQueue] = useState(null);

    const getSlots = async () => {
        if (!parkingLot_id) return;

        try {
            const res = await axios.get(`http://localhost:8080/api/parkingLot/slots?id=${parkingLot_id}`, { withCredentials: true });
            setSlots(res.data.data);
        } catch (error) {
            console.log("ไม่สามารถดึงช่องจอดได้");
        }
    };

    const getMyQueue = async () => {
        if (!user) return;

        try {
            const res = await axios.get(`http://localhost:8080/api/queue/getMyQueue?user_id=${user.user_id}`, { withCredentials: true });
            const queue = res.data.data.find(item => Number(item.parkinglot_id) === Number(parkingLot_id) && item.status === "Waiting");

            setMyQueue(queue || null);
            if (queue) {
                setStartTime(queue.start_time ? queue.start_time.slice(0, 16) : "");
                setEndTime(queue.end_time ? queue.end_time.slice(0, 16) : "");
            }
        } catch (error) {
            console.log("ไม่สามารถดึง Queue ได้");
        }
    };

    useEffect(() => {
        if (!user) return;

        getSlots();
        getMyQueue();

        const socket = io("http://localhost:8080");
        socket.emit("joinUserRoom", user.user_id);

        socket.on("parkingUpdate", () => {
            getSlots();
            getMyQueue();
        });

        socket.on("queueAutoReserved", data => {
            if (Number(data.parkingLot_id) !== Number(parkingLot_id)) return;

            alert(`${data.message}\n\nช่อง: ${data.parkingSlot_id}\nเวลา: ${data.start_time} - ${data.end_time}`);
            setMyQueue(null);
            getSlots();
            getMyQueue();
        });

        socket.on("queueAutoReserveFailed", data => {
            alert(data.message);
            getMyQueue();
        });

        return () => socket.disconnect();
    }, [user, parkingLot_id]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            getSlots();
            getMyQueue();
        }, 3000);

        return () => clearInterval(interval);
    }, [user, parkingLot_id]);

    const handleReservation = async slot => {
        if (slot.status !== "Available") return;

        if (myQueue) {
            alert("คุณมี Queue อยู่แล้ว กรุณารอให้ระบบจองอัตโนมัติ");
            return;
        }

        if (!startTime || !endTime) {
            alert("กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด");
            return;
        }

        const yourcar = car.find(thecar => thecar.user_id === user.user_id);
        if (!yourcar) {
            alert("ไม่พบรถของคุณ");
            return;
        }

        if (!window.confirm(`ยืนยันการจอง ${slot.parkingslot_name}\n${startTime} ถึง ${endTime}`)) return;

        try {
            const res = await axios.post("http://localhost:8080/api/reservation/reserve", {
                user_id: user.user_id,
                car_id: yourcar.vechicle_id,
                slot_id: slot.parkingslot_id,
                start_time: startTime,
                end_time: endTime
            }, { withCredentials: true });

            alert(res.data.message);
            getSlots();
        } catch (error) {
            alert(error.response?.data?.message || "จองไม่ได้");
        }
    };

    const handleJoinQueue = async () => {
        const yourcar = car.find(thecar => thecar.user_id === user.user_id);

        if (!yourcar) {
            alert("ไม่พบรถของคุณ");
            return;
        }

        if (!startTime || !endTime) {
            alert("กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุดก่อนเข้าคิว");
            return;
        }

        if (!window.confirm(`ลานจอดไม่มีช่องว่าง\n\nต้องการเข้าคิวหรือไม่?\n\nเวลา: ${startTime} ถึง ${endTime}\nค่ามัดจำ Queue 50 บาท\n\nเมื่อช่องว่าง ระบบจะจองให้คุณอัตโนมัติ`)) return;

        try {
            const res = await axios.post("http://localhost:8080/api/queue/joinQueue", {
                user_id: user.user_id,
                vechicle_id: yourcar.vechicle_id,
                parkingLot_id,
                start_time: startTime,
                end_time: endTime
            }, { withCredentials: true });

            alert(res.data.message);
            setMyQueue(res.data.data);
        } catch (error) {
            alert(error.response?.data?.message || "เข้าคิวไม่สำเร็จ");
        }
    };

    const handleCancelQueue = async () => {
        if (!myQueue) return;

        if (!window.confirm(`ต้องการยกเลิก Queue หมายเลข ${myQueue.queue_number} หรือไม่?`)) return;

        try {
            const res = await axios.post("http://localhost:8080/api/queue/cancelQueue", {
                queue_id: myQueue.queue_id,
                user_id: user.user_id
            }, { withCredentials: true });

            alert(res.data.message);
            setMyQueue(null);
            getMyQueue();
        } catch (error) {
            alert(error.response?.data?.message || "ยกเลิก Queue ไม่สำเร็จ");
        }
    };

    const hasAvailableSlot = slots.some(slot => slot.status === "Available");

    return (
        <div className="slots-page">
            <div className="slots-box">
                <h1>ช่องจอด</h1>

                {slots.length > 0 ? (
                    <div style={{ backgroundColor: 'white' }}>
                        <h2 style={{ backgroundColor: "white" }}>{slots[0].parkinglot_name}</h2>
                        <div style={{ backgroundColor: "white" }}>
                            <p style={{ backgroundColor: "white" }}>เวลาเริ่ม</p>
                            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ backgroundColor: "white" }} />

                            <p style={{ backgroundColor: "white" }}>เวลาสิ้นสุด</p>
                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ backgroundColor: "white" }} />
                        </div>

                        {myQueue && (
                            <div style={{ backgroundColor: "white", padding: "15px", margin: "15px 0" }}>
                                <h3 style={{ backgroundColor: "white" }}>Queue ของคุณ</h3>
                                <p style={{ backgroundColor: "white" }}>คิวหมายเลข: {myQueue.queue_number}</p>
                                <p style={{ backgroundColor: "white" }}>สถานะ: กำลังรอคิว</p>
                                <p style={{ backgroundColor: "white" }}>
                                    เวลา: {new Date(myQueue.start_time).toLocaleString()} - {new Date(myQueue.end_time).toLocaleString()}
                                </p>
                                <p style={{ backgroundColor: "white" }}>เมื่อช่องว่าง ระบบจะจองให้อัตโนมัติ</p>
                                <button onClick={handleCancelQueue}>ยกเลิก Queue</button>
                            </div>
                        )}

                        {slots.map(slot => (
                            <button className="slot-button" key={slot.parkingslot_id} onClick={() => handleReservation(slot)} disabled={slot.status !== "Available" || myQueue !== null}>
                                {slot.parkingslot_name} - {slot.status}
                            </button>
                        ))}

                        {!hasAvailableSlot && !myQueue && (
                            <div style={{ backgroundColor: "white" }}>
                                <p style={{ backgroundColor: "white" }}>ตอนนี้ไม่มีช่องจอดว่าง</p>
                                <p style={{ backgroundColor: "white" }}>เลือกเวลาแล้วกดเข้าคิว ระบบจะจองให้อัตโนมัติเมื่อมีช่องว่าง</p>
                                <button onClick={handleJoinQueue}>เข้าคิว</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-slot" style={{ backgroundColor: 'white' }}>ไม่พบช่องจอด</div>
                )}
            </div>
        </div>
    );
};

export default ParkingSlot;