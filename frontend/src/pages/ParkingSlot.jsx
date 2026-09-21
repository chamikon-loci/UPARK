import axios from "axios";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import '../styles/slots.css'

const ParkingSlot = ({user, car}) => {
    const location = useLocation();
    const slots = location.state?.slots || [];

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const handleReservation = async (slot) => {
        if (slot.status !== "Available") {
            return;
        }

        if (!startTime || !endTime) {
            alert("กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด");
            return;
        }

        const Confirm = window.confirm(`ยืนยันการจอง ${slot.parkingslot_name}\n${startTime} ถึง ${endTime}`);

        if (Confirm) {
            try {
                const res = await axios.post('http://localhost:8080/api/reservation/reserve',
                    {
                        user_id: user.user_id,
                        car_id: car[0].vechicle_id,
                        slot_id: slot.parkingslot_id,
                        start_time: startTime,
                        end_time: endTime
                    },
                    {withCredentials: true}
                );
                console.log(res.data.message);
                alert(res.data.message);

            } catch (error) {
                console.log(error.response?.data?.message);
                alert(error.response?.data?.message);
            }
        }
    };

    return (
        <div className="slots-page">
            <div className="slots-box">
                <h1>ช่องจอด</h1>

                {
                    slots.length > 0 ? (
                        <>
                            <h2 style={{backgroundColor: "white"}}>{slots[0].parkinglot_name}</h2>
                            <div style={{backgroundColor: "white"}}>
                                <p style={{backgroundColor: "white"}}>เวลาเริ่ม</p>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    style={{backgroundColor: "white"}}
                                />

                                <p style={{backgroundColor: "white"}}>เวลาสิ้นสุด</p>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    style={{backgroundColor: "white"}}
                                />
                            </div>

                            {
                                slots.map(slot => (
                                    <button
                                        className="slot-button"
                                        key={slot.parkingslot_id}
                                        onClick={() => handleReservation(slot)}
                                        disabled={slot.status !== "Available"}
                                    >
                                        {slot.parkingslot_name} - {slot.status}
                                    </button>
                                ))
                            }
                        </>
                    ) : (
                        <div className="no-slot">
                            ไม่พบช่องจอด
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ParkingSlot;